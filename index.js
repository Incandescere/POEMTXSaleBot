const puppeteer = require("puppeteer");
//const Telegraf=require('telegraf')
const {Composer}  = require('micro-bot')

//const bot = new Telegraf('1123755502:AAGKCqd36deAKDlj2dz-Am7201q4ZdvdGEs')

const bot = new Composer

const dailyList = async ()=>{
    
    // open the headless browser
    var browser = await puppeteer.launch({ args: ['--no-sandbox'], headless:true });

    // open a new page
    var page = await browser.newPage();

    const url = 'https://www.pathofexile.com/shop/category/daily-deals#';    

    //wait until there are no 2 connections in 500ms
    await page.goto(url, {waitUntil: 'networkidle2'});

    var nameList = await page.evaluate(()=>{

        var list = document.querySelectorAll('a.name')
        var ret = []

        for(var i=0; i<list.length;i++){
            ret[i]=list[i].innerText.trim()
        }
        ret.sort();

        for(var i=0;i<list.length;i++){
            ret[i] = (i+1)+": " +ret[i]
        }

        return ret;
    })

    //take ss
    //await page.screenshot({ path: "example.png" });

    //console.log(nameList);

    await browser.close();
    console.log("Queried");

    return nameList.join('\n');
};

var helpTip = ()=>{
    return `/fetch`+ " to fetch the daily sales for POE MTX"
}

var startTip = ()=>{
    return `/fetch`+ " to fetch the daily sales for POE MTX\n"+ `/help`+" for help tooltip"
}

bot.start((ctx) => ctx.reply(startTip()))
bot.help((ctx) => ctx.reply(helpTip()))
bot.on('sticker', (ctx) => ctx.reply('very nais sticcer'))
bot.hears('query', (ctx) => ctx.reply('something'))
bot.command('fetch', async (ctx)=>{
    ctx.reply('fetching latest info from website...')
    ctx.reply(await dailyList())
})

//bot.launch()
module.exports=bot
