const puppeteer = require('puppeteer')
const path = require('path')
const fs = require('fs')



async function openPage(){



    let options = {
        defaultViewport:null,
        headless:false,
    }

    const url = 'http://jiaowu.jvtc.jx.cn/jsxsd/'

    const browser = await puppeteer.launch(options)

    const page = await browser.newPage()

    await page.goto(url)
    // 截屏
    // await page.screenshot({path: 'screenshot.png'});

    // page.$eval('#ul1 > li:nth-child(5) > button', function(data){
    //     console.log(data)
    // })

    const userEle = await page.$('#ul1 .input-group input[type=text]')
    const passEle = await page.$('#ul1 .input-group input[type=password]')
    const btn = await page.$('#ul1 .input_li button[type=submit]')
    // 获取焦点
    await userEle.focus()
    //输入内容
    // 
    await page.keyboard.type('账号')

    await passEle.focus()
    //输入内容
    // 
    await page.keyboard.type('密码')

    //登录
    console.log('登录')
    await btn.click()


    // const path = await page.waitForNavigation()

    page.close()

    const newPage = await browser.newPage()

    // 内置 页面链接
    const stuInfoURL = 'http://jiaowu.jvtc.jx.cn/jsxsd/framework/xsMain_new.jsp?t1=1'

    await newPage.goto(stuInfoURL)

    
    // newPage.waitForSelector('span.maintext')
    // .then(async () => {
    //     const inputValidate = await page.$('span.maintext');
    //     onsole.log(inputValidate)
    // })

    // const userInfo =  await newPage.waitForSelector('div.middletopdwxxcont',{
    //     visible:true,
    //     timeout:5000
    // })
    // console.log(userInfo)
    // console.log('开始')

    //  ***的学工网 使用 iframe 嵌套页面 所以访问主页面无法获取内置页面元素


    // 学生基本信息
    console.log('获取学生基本信息')
    const stusInfo =  await newPage.$eval('body > div.middlewap > div.middlewapleftpart > div.middlewapleftup > div.middletopt.l', data => {

        // 匹配括号内容
        const reg = /\((.+?)\)/g
        const img =  reg.exec(data.firstElementChild.firstElementChild.getAttribute('style'))[1]
        const info = data.lastElementChild.lastElementChild.querySelectorAll('div')
        const StuData = {
            "学生姓名":info[5].innerHTML,
            "学生编号":info[8].innerHTML,
            "所属院系":info[11].innerHTML,
            "专业名称":info[14].innerHTML,
            "班级名称":info[17].innerHTML
        }
        return {
            headImg: 'http://jiaowu.jvtc.jx.cn/jsxsd' + img,
            StuData
        }
    })
    console.log('获取成功')

    newPage.close()

    // 学生成绩
    console.log('跳转学生成绩页面')
    const stuGradeBtURL = `http://jiaowu.jvtc.jx.cn/jsxsd/kscj/cjcx_list`

    const stuGradeBtn = await browser.newPage()

    await stuGradeBtn.goto(stuGradeBtURL)

    // 点击查询获取所有成绩
    

    // const a = await stuGradeBtn.waitForSelector('#btn_query', {
    //     timeout: 5000
    // })

    const query = await stuGradeBtn.$('#btn_query')
    console.log('获取学生成绩')
    const performance = await stuGradeBtn.$$eval('#dataList > tbody > tr', data => {
        // 全部成绩信息
        let allGradeInfo = {}
        // 单科成绩信息
        let itemGradeInfo = []

        //学期
        console.log()
        let semester = '2018-2019-1'
        data.forEach((item, i) => {
            if(i === 0) return 
            const info = item.children
            const obj = {
                "subject":info[3].innerHTML,
                // 成绩
                "grade":info[5].innerHTML.trim(),
                //学分
                "credit":info[7].innerHTML,
                // 绩点
                "point":info[9].innerHTML,
                // 考核方式
                "evaluationMode":info[11].innerHTML,
                //课程属性
                "curriculumAttribute":info[13].innerHTML,
                //课程性质
                "curriculum":info[14].innerHTML,
            }
            if(semester !== info[1].innerHTML || i === data.length-1){
                allGradeInfo[semester] = itemGradeInfo
                semester = info[1].innerHTML
                itemGradeInfo = []
            }
            itemGradeInfo.push(obj)
            
        });
        return allGradeInfo
    })
    console.log('获取学生成绩成功')
    const ws = fs.createWriteStream('data.json', {flags:'w',encoding:'utf-8',})
    ws.write(JSON.stringify(performance), (err) => {
        if(!err){
            stuGradeBtn.close()
            console.log('成绩导出完毕   ./data.json')
            console.log('结束运行')
        }
    })

}
openPage()