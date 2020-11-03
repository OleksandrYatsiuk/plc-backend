import { User } from './../interfaces/users.interface';
import Telegraf from 'telegraf';
import { Markup, Extra, Stage, session, BaseScene } from 'telegraf';
const { leave } = Stage;
import { Course, CustomMessage, EContentTypes, EMessageTypes, MessageOptions } from '../interfaces/index';
import axios from 'axios';
import { SceneContextMessageUpdate } from 'telegraf/typings/stage';
import { Message } from 'telegraf/typings/telegram-types';
const file = require('../../data.json');
// let bot = new Telegraf(process.env.BOT_TOKEN);
export const bot = new Telegraf(process.env.BOT_TOKEN);
// bot.use(Telegraf.log())
const link = 'https://lesson-frontend.herokuapp.com';
let USER: User;

const apiUrl = 'https://lesson-backend.herokuapp.com/api/v1';

// const apiUrl = 'http://localhost:5000/api/v1';

bot.telegram.deleteWebhook()
    .then(success => {
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

bot.hears('🔍 Про нас', (ctx): Promise<Message> => {
    return ctx.replyWithMarkdown(file.about);
})
bot.hears('☸ Результати', (ctx): Promise<Message> => {
    return ctx.reply(file.result);
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
const courses_lesson = new BaseScene('lessons')
courses_lesson.enter((ctx: SceneContextMessageUpdate & { session: any }) => {

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

    courses_lesson.action(/lesson:/, (ctx: SceneContextMessageUpdate & { session: any }) => {
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

    courses_lesson.action('next', (ctx: SceneContextMessageUpdate & { session: any }) => {
        ctx.reply('Ви можете вписати результати нижче:', Markup
            .keyboard([['Завершити',]])
            .oneTime()
            .resize()
            .extra())

        courses_lesson.on('message', (ctx: SceneContextMessageUpdate & { session: any }) => {
            ctx.session.data['isAddedMessage'] = true;
            const { message } = ctx.update;
            fetchFile(message, (result: MessageOptions) => {
                const data: CustomMessage = {
                    chat_id: message.chat.id,
                    lessonId: ctx.session.data.lesson,
                    type: EMessageTypes.user,
                    message: {
                        id: message.message_id,
                        content: result
                    },
                }
                axios.post(apiUrl + '/messages', data)
                    .then(result => console.log(result.data))
                    .catch(err => console.error(err));
            })
        })

        courses_lesson.hears('Завершити', leave())

        courses_lesson.leave((ctx) => {
            ctx.reply('Ваша відповідь була прийнята. Найближчим часом буде зроблена перевірка і надісланий результат:)');
        });
    })
})



bot.hears('📞 Контакти', (ctx): Promise<Message> => {
    return ctx.replyWithMarkdown(`Open: [Contacts](${link})`);
})

const stage = new Stage([courses_lesson]);

bot.use(session());
bot.use(stage.middleware());



bot.action(/course/, (ctx: any) => {
    return ctx.scene.enter('lessons');
});


function fetchFile(msg: Message, cb: Function): void {
    if (msg.document) {
        getFileLink(msg.document.file_id)
            .then(link => cb({ type: EContentTypes.file, link: link, text: msg.caption }));
    } else if (msg.photo) {
        getFileLink(msg.photo[0].file_id)
            .then(link => cb({ type: EContentTypes.photo, link: link, text: msg.caption }));
    } else {
        cb({ type: EContentTypes.text, link: null, text: msg.text })
    }
}

function getFileLink(fileId: string): Promise<string> {
    return bot.telegram.getFileLink(fileId);
}