import { FileOptions } from './../interfaces/messages.interface';
import Telegraf, { Context, Middleware } from 'telegraf';
import { Markup, Extra, Stage, session, BaseScene } from 'telegraf';
const { leave } = Stage;
import * as  WizardScene from 'telegraf/scenes/wizard';
import * as TelegramBot from 'node-telegram-bot-api';
import { Course, CustomMessage } from '../interfaces/index';
import axios from 'axios';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import { TelegrafContext } from 'telegraf/typings/context';
import { Message } from 'telegraf/typings/telegram-types';
const file = require('../../data.json');
const bot = new Telegraf(process.env.BOT_TOKEN);

// const teleg_bot = new TelegramBot(process.env.BOT_TOKEN, {webHook:false})

// bot.use(Telegraf.log())
const link = 'https://lesson-frontend.herokuapp.com';

// const apiUrl = 'https://lesson-backend.herokuapp.com/api/v1';

const apiUrl = 'http://localhost:5000/api/v1';

bot.telegram.deleteWebhook().then(success => {
    success && console.log('🤖 is listening to your commands');
    bot.startPolling();
});



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
const scheme = new BaseScene('get-lessons')
scheme.enter((ctx: SceneContextMessageUpdate & { session: any }) => {

    const courseId = ctx.match.input.split(':')[1];
    ctx.session.data = { courseId: courseId };
    axios.get(apiUrl + '/lessons', { params: { courseId } })
        .then(result => {
            const lessons = result.data.result;
            ctx.reply('Виберіть  урок', Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                    lessons.map(lesson => m.callbackButton(lesson.name, `lesson:${lesson.id}`))
                ])))
        })

    scheme.action(/lesson:/, (ctx: SceneContextMessageUpdate & { session: any }) => {
        const lessonId = ctx.match.input.split(':')[1];
        ctx.session.data['lesson'] = lessonId;
        axios.get(apiUrl + `/lessons/${lessonId}`).then(result => {
            const lesson = result.data.result;
            ctx.reply(JSON.stringify(lesson),
                Extra.HTML().markup((m) =>
                    m.inlineKeyboard([m.callbackButton('Далі', 'next')])
                ))
        })

    })

    scheme.action('next', (ctx: SceneContextMessageUpdate & { session: any }) => {
        ctx.reply('Ви можете вписати результати нижче:', Markup
            .keyboard([['Завершити',]])
            .oneTime()
            .resize()
            .extra())

        scheme.on('message', (ctx: SceneContextMessageUpdate & { session: any }) => {
            ctx.session.data['isAddedMessage'] = true;
            const { message } = ctx.update;
            const data: CustomMessage = {
                chat_id: message.chat.id,
                message: {
                    id: message.message_id,
                    text: message.text,
                    date: message.date
                },
                lessonId: ctx.session.data.lesson
            }
            fetchFile(message, (file: FileOptions) => {
                file.type == 'photo' ? data.message.photo = file : data.message.document = file;
                axios.post(apiUrl + '/messages', data)
                    .then(result => console.log(result.data.result))
                    .catch(err => ctx.reply(err.response.data));
            })
        })
    })

    scheme.hears('Завершити', leave())

    scheme.leave((ctx) => {
        ctx.reply('Ваша відповідь була прийнята. Найближчим часом буде зроблена перевірка і надісланий результат:)');
    });
})


bot.hears('📞 Контакти', (ctx) => {
    ctx.replyWithMarkdown(`Open: [Contacts](${link})`);
})

const stage = new Stage([scheme]);

bot.use(session());
bot.use(stage.middleware());

bot.action(/course/, (ctx: any) => {
    return ctx.scene.enter('get-lessons');
});

function fetchFile(msg: Message, cb: Function): void {
    if (msg.document) {
        getFileLink(msg.document.file_id)
            .then(link => cb({ type: 'file', link: link, caption: msg.caption }))
    } else if (msg.photo) {
        getFileLink(msg.photo[0].file_id)
            .then(link => cb({ type: 'photo', link: link, caption: msg.caption }))
    }
}
function getFileLink(fileId: string): Promise<string> {
    return bot.telegram.getFileLink(fileId);
}