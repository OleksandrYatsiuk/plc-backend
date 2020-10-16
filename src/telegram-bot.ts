import Telegraf from 'telegraf';
import { Markup, Extra } from 'telegraf';
import * as axios from 'axios';
const file = require('../data.json');
const bot = new Telegraf(process.env.BOT_TOKEN);
const link = 'https://lesson-frontend.herokuapp.com';
const apiUrl = 'https://lesson-backend.herokuapp.com/api/v1';

bot.telegram.deleteWebhook().then(success => {
    success && console.log('🤖 is listening to your commands');
    bot.startPolling();
})

bot.start(ctx => {
    axios.default.patch(apiUrl + '/users/current', { phone: ctx['startPayload'], chat_id: ctx.chat.id })
    return ctx.reply('Main menu', Markup
        .keyboard([
            ['🔍 Про нас', '😎 Курси'], // Row1 with 2 buttons
            ['☸ Результати', '📞 Контакти'], // Row2 with 2 buttons
            ['☸ Оплата'], // Row2 with 2 buttons
        ])
        .oneTime()
        .resize()
        .extra())
})

bot.hears('🔍 Про нас', ctx => {
    ctx.reply(file.about);
})
bot.hears('☸ Результати', ctx => {
    ctx.reply(file.result);
})
bot.hears('😎 Курси', ctx => {
    ctx.reply(file.price);
})
bot.hears('📞 Контакти', (ctx) => {
    ctx.replyWithMarkdown(`Open: [Contacts](${link})`);
})
bot.hears('☸ Оплата', ctx => {
    return ctx.reply('Practical Legal Courses – школа нового формату', Extra.HTML().markup((m) =>
        m.inlineKeyboard([
            m.urlButton('Оплатити', `${link}/payment?chat_id=${ctx.chat.id}&courseId=1`),
        ])))
});