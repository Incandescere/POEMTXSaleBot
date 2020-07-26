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

    var nameList = await page.evaluate(()=>{
        var itemList = []
        document.querySelectorAll('a.name').forEach(x=>itemList.push(x.innerText.trim()))
        var priceList = []
        document.querySelectorAll('div.price').forEach(x=>priceList.push(x.innerText.trim()))
        // var images = []
        // document.querySelectorAll('div>a>img.itemImage.replace').forEach(x=>images.push(x.src))

        var ret = priceList

        for(var i=0; i<itemList.length;i++){
            ret[i]=itemList[i]+' '+priceList[i]/*+' \n'+images[i]*/;
        }

        ret.sort();

        for(var i=0;i<itemList.length;i++){
            ret[i] = (i+1)+": " +ret[i]
        }

        return ret;
    })

    //take ss
    //await page.screenshot({ path: "example.png" });

    //console.log(nameList);

    await browser.close();

    return nameList.join('\n')
};

const imageLinks = async ()=>{
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
            }, 200)
        })  
    })
    
    // var crawler = scrollTimer.then(async () => {
    //     var urls = await page.evaluate(() => {
    //         var links = [...document.querySelectorAll('div>a>img.itemImage.replace')]
    //         return links.map(img => {
    //             return img.src
    //         })
    //     })
    
    //     await page.close()
    //     return Promise.resolve(urls)
    // }).catch((e) => {
    //     console.log(e)
    // })

    var trawl = scrollTimer.then(async ()=>{
        var images = await page.evaluate(()=>{
            var ret = []
            document.querySelectorAll('div>a>img.itemImage.replace').forEach(x=>ret.push(x.src));
            return ret;
        })
        await page.close()
        return images.join('\n\n')
    })
    return trawl;
}

var helpTip = ()=>{
    return `/fetch`+ " to fetch the daily sales for POE MTX"
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

bot.command('links', async (ctx)=>{
    console.log('fetch image links')
    ctx.reply('fetching links from website...')
    ctx.reply(await imageLinks())
})

//bot.launch()
module.exports=bot