import Telegraf from 'telegraf';
import {Markup} from 'telegraf';
import * as axios from 'axios';
const file  = require('../data.json');
const bot = new Telegraf(process.env.BOT_TOKEN);
const link = 'https://lesson-frontend.herokuapp.com/';

bot.telegram.deleteWebhook().then(success => {
    success && console.log('🤖 is listening to your commands');
    bot.startPolling();
})


bot.start(({ reply }) => {

    return reply('Main menu', Markup
        .keyboard([
            ['🔍 Про нас', '😎 Курси'], // Row1 with 2 buttons
            ['☸ Результати', '📞 Контакти'], // Row2 with 2 buttons
            ['☸ Оплата'], // Row2 with 2 buttons
        ])
        .oneTime()
        .resize()
        .extra()
    )
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
bot.hears('📞 Контакти', ctx => {
    ctx.reply('Contacts: ' + link);
})
bot.hears('☸ Оплата', ctx => {
    ctx.reply('Open ' + link+'/payment');
})