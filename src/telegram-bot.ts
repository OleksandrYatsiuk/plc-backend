import Telegraf from 'telegraf';
import { Markup, Extra, Stage, session } from 'telegraf';
import * as  WizardScene from 'telegraf/scenes/wizard';
import { Course } from './interfaces/index';
import axios from 'axios';

const file = require('../data.json');
const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use(Telegraf.log())
const link = 'https://lesson-frontend.herokuapp.com';
// const apiUrl = 'https://lesson-backend.herokuapp.com/api/v1';
const apiUrl = 'http://localhost:5000/api/v1';

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
        ctx.wizard.state.data = lessonId;
        axios.get(apiUrl + `/lessons/${lessonId}`).then(result => {
            const lesson = result.data.result;
            ctx.reply(JSON.stringify(lesson),
                Extra.HTML().markup((m) =>
                    m.inlineKeyboard([m.callbackButton('Далі', 'next')])
                ))
        })

        return ctx.wizard.next()
    },
    ctx => {

        ctx.reply('Ви можете вписати результати нижче:', Markup
            .keyboard([['Завершити']])
            .oneTime()
            .resize()
            .extra())
        return ctx.wizard.next()
    },
    ctx => {

        let msg = ctx.update.message
        const data = {
            chat_id: msg.chat.id,
            message: {
                id: msg.message_id,
                text: msg.text,
                date: msg.date,
                photo: fetchPhoto(msg),
                document: fetchDocument(msg)
            },
            lessonId: ctx.wizard.state.data,
        }

        console.log(data);

        axios.post(apiUrl + '/messages', data)
            .then(result => {
                console.log(result.data.result)
            })
            .catch(err => console.log(err.response.data))

        if (ctx.update.message.text == 'Завершити') {
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
function fetchPhoto(msg) {
    if (msg.photo) {
        return {
            id: msg.photo[0].file_id,
            caption: msg.caption
        }
    }
}
function fetchDocument(msg) {
    if (msg.document) {
        return {
            id: msg.document.file_id,
            caption: msg.caption
        }
    }

}