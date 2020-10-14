import Telegraf from 'telegraf';
import {Markup} from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);
const link = 'https://lesson-frontend.herokuapp.com/';

bot.telegram.deleteWebhook().then(success => {
    success && console.log('🤖 is listening to your commands')
    bot.startPolling()
})


bot.start(({ reply }) => {
    reply('About us ' + link);

    return reply('Main menu', Markup
        .keyboard([
            ['🔍 Про нас', '😎 Курси'], // Row1 with 2 buttons
            ['☸ Setting', '📞 Контакти'], // Row2 with 2 buttons
        ])
        .oneTime()
        .resize()
        .extra()
    )
})

bot.hears('🔍 Про нас', ctx => {
    ctx.reply('About us ' + link);
})
bot.hears('😎 Курси', ctx => {
    ctx.reply('Courses: ' + link);
})
bot.hears('😎 Курси', ctx => {
    ctx.reply('Courses: ' + link);
})
bot.hears('📞 Контакти', ctx => {
    ctx.reply('Contacts: ' + link);
})