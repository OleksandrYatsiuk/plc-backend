import Telegraf from 'telegraf';
import { Markup, Extra, Stage, session } from 'telegraf';
import * as  WizardScene from 'telegraf/scenes/wizard';
import { Course } from './interfaces/index';
import axios from 'axios';

const file = require('../data.json');
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log())
const link = 'https://lesson-frontend.herokuapp.com';
const apiUrl = 'https://lesson-backend.herokuapp.com/api/v1';

bot.telegram.deleteWebhook().then(success => {
    success && console.log('🤖 is listening to your commands');
    bot.startPolling();
})


bot.start(ctx => {
    if (ctx['startPayload']) {
        axios.patch(apiUrl + '/users/current', { phone: "+" + ctx['startPayload'], chat_id: ctx.chat.id });
    }
    return ctx.reply('Main menu', Markup
        .keyboard([
            ['🔍 Про нас', '👨‍🎓 Курси'],
            ['☸ Результати', '📞 Контакти'],
            ['💰 Оплата'],
        ])
        .oneTime()
        .resize()
        .extra())
})

bot.hears('🔍 Про нас', ctx => {
    ctx.replyWithMarkdown(file.about);
})
bot.hears('☸ Результати', ctx => {
    ctx.reply(file.result);
})
bot.hears('👨‍🎓 Курси', (ctx) => {
    return axios.get(apiUrl + '/courses').then(result => {
        const courses: Course[] = result.data.result;
        return ctx.reply('Виберіть курс', Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                courses.map(course => m.callbackButton(course.name, `course:${course.id}`))
            ])));
    })
})

bot.hears('💰 Оплата', ctx => {
    return ctx.reply('Practical Legal Courses – школа нового формату',
        Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                m.urlButton('Оплатити', `${link}/payment?chat_id=${ctx.chat.id}&courseId=1`),
            ])))
});


const superWizard = new WizardScene(
    'lesson-stepper',
    ctx => {
        let courseId = ctx.match.input.split(':')[1];
        axios.get(apiUrl + '/lessons', { params: { courseId } }).then(result => {
            const lessons = result.data.result;
            ctx.reply('Виберіть  урок', Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    lessons.map(lesson => m.callbackButton(lesson.name, `${lesson.id}`))
                ])))
        })
        ctx.wizard.state.data = {};
        return ctx.wizard.next();
    },
    ctx => {
        const lessonId = ctx.update.callback_query.data;
        axios.get(apiUrl + `/lessons/${lessonId}`).then(result => {
            const lesson = result.data.result;
            ctx.reply(JSON.stringify(lesson));
        })
        return ctx.wizard.next()
    },
    ctx => {
        ctx.reply('Додати ще коментар чи файл?', Markup
            .keyboard([['Завершити']])
            .oneTime()
            .resize()
            .extra())
        return ctx.wizard.next()
    },
    ctx => {
        if (ctx.message.text == 'Завершити') {
            ctx.reply('Bye!')
            return ctx.scene.leave();
        }
    }
);


bot.hears('📞 Контакти', (ctx) => {
    ctx.replyWithMarkdown(`Open: [Contacts](${link})`);
})


const stage = new Stage([superWizard]);
bot.use(session());
bot.use(stage.middleware());

bot.action(/course/, ctx => {
    return ctx['scene'].enter('lesson-stepper');
});