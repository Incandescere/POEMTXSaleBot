const puppeteer = require("puppeteer");
//const Telegraf=require('telegraf');
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

    var scrollTimer = page.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0
            var distance = 600
            var timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
    
                if(totalHeight >= document.body.scrollHeight){
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })  
    })

    var collatedList = scrollTimer.then(async ()=>{
      
        var itemList = await page.evaluate(()=>{
            var items = []
            document.querySelectorAll('a.name').forEach(x=>items.push(x.innerText.trim()))
            return items;
        })
        var priceList = await page.evaluate(()=>{
            var prices = []
            document.querySelectorAll('div.price').forEach(x=>prices.push(x.innerText.trim()))
            return prices;
        })
        // var imageurlList = await page.evaluate(()=>{
        //     var imageurls = []
        //     document.querySelectorAll('div>a>img.itemImage.replace').forEach(x=>imageurls.push(x.src));
        //     return imageurls;
        // })

        var collated =[]
        for(var i=0;i<itemList.length;i++){
            collated[i]=(itemList[i]+' '+priceList[i])
        }

        await page.close()
        return collated.sort()
    })

    //take ss
    //await page.screenshot({ path: "example.png" });

    //console.log(nameList);

    return (await collatedList).join('\n')
};



const newsFeed = async ()=>{
    // open the headless browser
    var browser = await puppeteer.launch({ args: ['--no-sandbox'], headless:true });

    // open a new page
    var page = await browser.newPage();

    const url = 'https://www.pathofexile.com/forum/view-forum/news';    

    //wait until there are no 2 connections in 500ms
    await page.goto(url, {waitUntil: 'networkidle2'});

    var scrollTimer = page.evaluate(() => {
        return new Promise((resolve, reject) => {
            var totalHeight = 0
            var distance = 600
            var timer = setInterval(() => {
                window.scrollBy(0, distance)
                totalHeight += distance
    
                if(totalHeight >= document.body.scrollHeight){
                    clearInterval(timer)
                    resolve()
                }
            }, 100)
        })  
    })

    var forumPosts = scrollTimer.then(async ()=>{

        var titleList = await page.evaluate(()=>{
            var threads = document.querySelectorAll('div.thread_title>div.title>a')
            var dates = document.querySelectorAll('span.post_date')
            var titlenurl = []
            for(var i=0;i<threads.length;i++){
                titlenurl[i]=dates[i].innerText.slice(2,)+'\n'+threads[i].innerText+'\n'+threads[i].href+'\n'
            }
            return titlenurl
        })

        
        await page.close()
        return await titleList
    })

    return (await forumPosts).join('\n')
}


var helpTip = ()=>{
    var help = `
    /fetch to fetch the daily sales for POE MTX \n/news for the latest forum news posts
    `

    return help
}

var startTip = ()=>{
    return `/fetch`+ " to fetch the daily sales for POE MTX\n"+ `/help`+" for help tooltip"
}

bot.start((ctx) => {
    console.log('start command recd')
    ctx.reply(startTip())
})

bot.help((ctx) => {
    console.log('help command recd')
    ctx.reply(helpTip())
})

bot.on('sticker', (ctx) => ctx.reply('very nais sticcer'))

bot.hears('query', (ctx) => ctx.reply('something'))

bot.command('fetch', async (ctx)=>{
    console.log('fetch command recd')
    ctx.reply('fetching latest info from website...')
    ctx.reply(await dailyList())
})

bot.command('news', async (ctx)=>{
    console.log('news command recd')
    ctx.reply('fetching latest news posts...')
    ctx.reply(await newsFeed())
})

//bot.launch()
module.exports=bot