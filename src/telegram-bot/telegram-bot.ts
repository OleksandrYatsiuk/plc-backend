import Telegraf from 'telegraf';
import { Markup, Extra, Stage, session } from 'telegraf';
import { Message } from 'telegraf/typings/telegram-types';
import { ApiHelperService } from './request-helper';
import { courses_lesson } from './schenes/lesson';
import { about, result } from './storage/texts';
import { urls } from './storage/url';
export const bot = new Telegraf(process.env.BOT_TOKEN);
const backend = new ApiHelperService(urls.local.backend)

bot.telegram.deleteWebhook()
    .then(success => {
        success && console.log('🤖 is listening to your commands');
        bot.startPolling();
    });



bot.start(ctx => {
    if (ctx['startPayload']) {
        backend.updateUser({ phone: "+" + ctx['startPayload'], chat_id: ctx.chat.id })
            .then(response => console.log(response));
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

bot.hears('🔍 Про нас', (ctx: any): Promise<Message> => {
    return ctx.replyWithMarkdown(about);
})
bot.hears('☸ Результати', (ctx: any): Promise<Message> => {
    return ctx.reply(result);
})
bot.hears('👨‍🎓 Курси', (ctx: any) => {
    backend.courseList().then(courses => {
        return ctx.reply('Виберіть курс', Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                courses.map(course => m.callbackButton(course.name, `course:${course.id}`))
            ])));
    })
})

bot.hears('💰 Оплата', (ctx: any) => {
    return ctx.reply('Practical Legal Courses – школа нового формату',
        Extra.HTML().markup((m) =>
            m.inlineKeyboard([
                m.urlButton('Оплатити', `${urls.prod.frontend}/payment?chat_id=${ctx.chat.id}&courseId=1`),
            ])))
});

bot.hears('📞 Контакти', (ctx): Promise<Message> => {
    return ctx.replyWithMarkdown(`Open: [Contacts](${urls.prod.frontend})`);
})

const stage = new Stage([courses_lesson]);

bot.use(session());
bot.use(stage.middleware());



bot.action(/course/, (ctx: any) => {
    return ctx.scene.enter('lessons');
});