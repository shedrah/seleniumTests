const {Builder, By, Key, Keys, WebDriver, until, Condition} = require("selenium-webdriver");
const assert = require("assert");


async function verifyPopup(passengers, destFrom, destTo, flightDate){


    // launch browser
    let driver = await new Builder().forBrowser("firefox").build();


    // navigate to ryanair website
    await driver.get("https://www.ryanair.com/ie/en")
    await driver.manage().setTimeouts({implicit: 5000});


    // input values //
    var passengers = passengers //[2,2,2,2]; // [#Adults, #Teens, #Children, #Infant]
    var destFrom = destFrom //"DUB";
    var destTo = destTo //"STN";
    var flightDate = flightDate //"2023-Oct-13";
    var flightMonth = flightDate.substring(flightDate.indexOf("-")+1, flightDate.lastIndexOf("-"));
    function getNumberFromMonth(month){
        return new Date(Date.parse(month +" 1, 2023")).getMonth()+1
    };
    var monthNum = getNumberFromMonth(flightMonth);
    if(monthNum<10) {
        monthNum='0'+monthNum;
    }
    flightDate = flightDate.replace(flightMonth, monthNum);


    // custom wait
    until.elementIsNotPresent = function elementIsNotPresent(locator) {
        return new Condition('for no element to be located ' + locator, function(driver) {
        return driver.findElements(locator).then(function(elements) {
            return elements.length === 0;
        });
        });
    };
    // todo //
    // accept cookies
    let loginBtn = await driver.findElement(By.className("cookie-popup-with-overlay__button"));
    await loginBtn.click();


    // input departure
    await driver.findElement(By.id("input-button__departure")).click();
    await driver.findElement(By.id("input-button__departure")).clear();
    await driver.findElement(By.id("input-button__departure")).sendKeys(`${destFrom}`);
    await driver.findElement(By.xpath("/html/body/ry-tooltip/div[2]/hp-app-controls-tooltips/fsw-controls-tooltips-container/fsw-controls-tooltips/fsw-origin-container/fsw-airports/div/fsw-airports-list/div[2]/div[1]/fsw-airport-item[1]")).click();


    // input destination
    await driver.findElement(By.id("input-button__destination")).sendKeys(`${destTo}`);
    await driver.findElement(By.xpath("/html/body/ry-tooltip/div[2]/hp-app-controls-tooltips/fsw-controls-tooltips-container/fsw-controls-tooltips/fsw-destination-container/fsw-airports/div/fsw-airports-list/div[2]/div[1]/fsw-airport-item[2]")).click();


    // choose trip type
    await driver.findElement(By.xpath("/html/body/hp-app-root/hp-home-container/hp-home/hp-search-widget-container/hp-search-widget/div/hp-flight-search-widget-container/fsw-flight-search-widget-container/fsw-flight-search-widget/fsw-trip-type-container/fsw-trip-type/fsw-trip-type-button[2]/button")).click();


    // input date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; 
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd;
    } 

    if(mm<10) {
        mm='0'+mm;
    }
    const dateToday = yyyy +'-'+ mm + '-'+ dd;
    try{
        await driver.findElement(By.css(`div[class="calendar-body__cell"][data-id='${flightDate}']`))
    }catch{
        while(!await driver.findElement(By.css(`div[class="m-toggle__month"][data-id='${flightMonth}']`)).isDisplayed()){
            await driver.findElement(By.xpath("/html/body/ry-tooltip/div[2]/hp-app-controls-tooltips/fsw-controls-tooltips-container/fsw-controls-tooltips/fsw-flexible-datepicker-container/fsw-datepicker/ry-datepicker-desktop/month-toggle/div/div[3]")).click();
        }
        await driver.findElement(By.css(`div[class="m-toggle__month"][data-id='${flightMonth}']`)).click()
    }
    await driver.findElement(By.css(`div[class="calendar-body__cell"][data-id='${flightDate}']`)).click();


    // input passengers - array passengers=[#Adults, #Teens, #Children, #Infant]
    passengers = [[passengers[0], "Adults"], [passengers[1], "Teens"],[passengers[2], "Children"] ,[passengers[3], "Infant"]];
    var infantFlag=false;
    await Promise.all(passengers.map(async(element)=>{
        for(let i=0; i<element[0];i++){
            if(element[1]=="Adults" && i!=element[0]-1){
                let child = driver.findElement(By.css(`ry-counter-button[class='counter__button'][aria-label='${i+1}Adults+1']`));
                let parent = child.findElement(By.xpath("./..")).click();
                await driver.sleep(2000);
            }else if(element[1]=="Children"){
                let child = driver.findElement(By.css(`ry-counter-button[class='counter__button'][aria-label='0Children+1']`));
                let parent = child.findElement(By.xpath("./..")).click();
            }else if(element[1]=="Teens"){
                let child = driver.findElement(By.css(`ry-counter-button[class='counter__button'][aria-label='0Teens+1']`));
                let parent = child.findElement(By.xpath("./..")).click();
            }else if(element[1]=="Infant"){ 
                if(!infantFlag){  
                    let child = await driver.findElement(By.css(`ry-counter-button[class='counter__button'][aria-label='0Infant+1']`));
                    let parent = await child.findElement(By.xpath("./..")).click();
                    await driver.findElement(By.xpath("/html/body/hp-app-root/ry-portal[1]/div/ng-component/ry-dialog/div/div[3]/button")).click();
                    infantFlag=true;
                }else{                                 
                    let child = await driver.findElement(By.css(`ry-counter-button[class='counter__button'][aria-label='1Infant+1']`));
                    let parent = await child.findElement(By.xpath("./.."))
                    driver.executeScript("arguments[0].click();", parent)     
                }  
            }
            }
    }))


    // search for flights
    var searchBtn = driver.findElement(By.xpath("/html/body/hp-app-root/hp-home-container/hp-home/hp-search-widget-container/hp-search-widget/div/hp-flight-search-widget-container/fsw-flight-search-widget-container/fsw-flight-search-widget/div/div/div/button"));
    await driver.executeScript("arguments[0].click();", searchBtn)


    // input flight
    await driver.wait(until.elementLocated(By.xpath("/html/body/app-root/flights-root/div/div/div/div/flights-lazy-content/flights-summary-container/flights-summary/div/div[1]/journey-container/journey/flight-list/ry-spinner/div/flight-card-new[1]")));
    await driver.findElement(By.xpath("/html/body/app-root/flights-root/div/div/div/div/flights-lazy-content/flights-summary-container/flights-summary/div/div[1]/journey-container/journey/flight-list/ry-spinner/div/flight-card-new[1]")).click();


    // choose VALUE fare 
    var fareBtn = await driver.findElement(By.className("fare-card__button fare-card__price ry-button--outline-dark-blue"));
    await driver.executeScript("arguments[0].click();", fareBtn);


    // and continue with chosen VALUE fare
    var continueBtn = await driver.findElement(By.className("fare-upgrade-footer-continue_button ry-button--outline-light-blue ry-button--full"));
    await driver.wait(until.elementIsEnabled(continueBtn), 10000);
    await driver.executeScript("arguments[0].click();", continueBtn);


    //price changed pop up handling
    var popupGone = false;
    while(!popupGone){
        try{
        await driver.findElement(By.xpath("/html/body/app-root/ry-portal/div/basket-error-container-component/basket-error-component/ry-message-dialog/ry-dialog/div/div[2]/div[2]/button")).click();
        await driver.findElement(By.xpath("/html/body/app-root/flights-root/div/div/div/div/flights-lazy-content/flights-summary-container/flights-summary/div/div[1]/journey-container/journey/flight-list/ry-spinner/div/flight-card-new[1]")).click();
        // choose VALUE fare and continue 
        var fareBtn = await driver.findElement(By.className("fare-card__button fare-card__price ry-button--outline-dark-blue"));
        await driver.executeScript("arguments[0].click();", fareBtn);
        var continueBtn = await driver.findElement(By.className("fare-upgrade-footer-continue_button ry-button--outline-light-blue ry-button--full"));
        await driver.executeScript("arguments[0].click();", continueBtn);
        }catch(NoSuchElementError){
            popupGone=true;
            // skip login
            await driver.wait(until.elementLocated(By.className("login-touchpoint__login-later title-m-lg title-m-sm")));
            await driver.findElement(By.className("login-touchpoint__login-later title-m-lg title-m-sm")).click();
        }
    }


    // enter passengers
    var nameStr = "bob";
    mm = mm - 1;
    if(mm<10){
        mm = "0"+mm
    }
    if(dd>3){
        dd= dd-3
        if(dd<10){
            dd = "0"+dd
        }
    }

    for(let j=0;j<passengers.length; j++){
        var passengerType = "ADT"
        if(passengers[j]=="Adults"){
            passengerType = "ADT"
        }else if(passengers[j][1]=="Teens"){
            passengerType = "TEEN"
        }else if(passengers[j][1]=="Children"){
            passengerType = "CHD"
        }else if(passengers[j][1]=="Infant"){
            passengerType = "INF"
        }
        for(let i=0; i<passengers[j][0];i++){
            // enter title
            if(passengerType!="CHD" && passengerType!="INF"){
                var parent = driver.findElement(By.css(`div[data-ref='pax-details__${passengerType}-${i}']`))
                await parent.findElement(By.css("button[class='dropdown__toggle body-l-lg body-l-sm']")).click();
                await parent.findElement(By.xpath("//*[@data-ref='title-item-0']")).click();
            }
            // enter first name
            var firstName = await driver.findElement(By.id(`form.passengers.${passengerType}-${i}.name`));
            await firstName.click();
            await firstName.sendKeys(nameStr);
            nameStr+="b";
            // enter last name
            var lastName = await driver.findElement(By.id(`form.passengers.${passengerType}-${i}.surname`));
            await lastName.click();
            await lastName.sendKeys('boberson');
            // enter birth date
            if(passengerType=="INF"){
                var birthDate = await driver.findElement(By.css(`input[id='form.passengers.INF-${i}.dateOfBirth']`));
                var birthDateStr = (yyyy+'-'+mm+'-'+dd).toString();
                await birthDate.sendKeys(birthDateStr);
            }
        }
    }


    // confirm passengers
    await driver.findElement(By.xpath("/html/body/app-root/flights-root/div/div/div/div/flights-lazy-content/ng-component/div/continue-flow-container/continue-flow/div/div/span/button")).click();


    // close popup
    if(await driver.findElements(By.xpath("/html/body/seats-root/ry-portal/div/seats-modal/ry-dialog/div/div[2]/div[2]/button"))!=0){
        await driver.wait(until.elementLocated(By.xpath("/html/body/seats-root/ry-portal/div/seats-modal/ry-dialog/div/div[2]/div[2]/button")));
        await driver.findElement(By.xpath("/html/body/seats-root/ry-portal/div/seats-modal/ry-dialog/div/div[2]/div[2]/button")).click();
    }


    // wait for overlay to be gone
    await driver.wait(until.elementIsNotPresent(By.xpath("/html/body/seats-root/ry-portal/div/seats-modal/ry-dialog/ry-overlay")),10000);
    try{
        await driver.wait(until.elementIsNotPresent(By.css('div[class="header__center"]')),5000);
    }catch(TimeoutError){
        console.log("")
    }


    // input seats
    // ADT+INF -> every CHD -> rest of ADT+INF -> every TEEN
    var numberOfSeats = passengers[0][0]+passengers[1][0]+passengers[2][0];
    var numberOfCHD = passengers[2][0];
    try{
        await driver.wait(until.elementIsNotPresent(By.css('div[class="header__center"]')),10000);
    }catch(TimeoutError){
        console.log("")
    }
    if(passengers[3][0]!=0){
        await driver.wait(until.elementLocated(By.css("icon[iconid='glyphs/baby']")));
    }else{
        await driver.wait(until.elementLocated(By.css("button[class='seatmap__seat seatmap__seat--standard ng-star-inserted']")));
    }
    for(i=0; i<numberOfSeats; i++){
        // pick first ADT+INF seat
        if((await driver.findElements(By.css("icon[iconid='glyphs/baby']"))).length!=0){
            var baby = await driver.findElement(By.css("icon[iconid='glyphs/baby']"));
            var babyId = await baby.findElement(By.xpath("..")).getAttribute("id");
            if(babyId.slice(-1)=='F'){
                var currSeat = String.fromCharCode(babyId.slice(-1).charCodeAt(0) - 1);      
            }else{
                var currSeat = String.fromCharCode(babyId.slice(-1).charCodeAt(0) + 1);
            }
            currSeat=babyId.slice(0,-1)+currSeat;
            await driver.findElement(By.css("icon[iconid='glyphs/baby']")).click();
        // pick all CHD seats
        }else if(numberOfCHD!=0){
            await driver.findElement(By.css(`button[id='${currSeat}']`)).click();
            if(babyId.slice(-1)=='F'){
                var lastLetter = String.fromCharCode(currSeat.slice(-1).charCodeAt(0) - 1);     
            }else{
                var lastLetter = String.fromCharCode(currSeat.slice(-1).charCodeAt(0) + 1);
            }
            currSeat=currSeat.slice(0,-1)+lastLetter;
            --numberOfCHD
        // pick remaining seats
        }else{
            await driver.findElement(By.css("button[class='seatmap__seat seatmap__seat--standard ng-star-inserted']")).click();
        } 
    }


    // continue with chosen seats
    await driver.findElement(By.css("button[data-ref='seats-action__button-continue']")).click();


    // decline fast track
    await driver.findElement(By.css("button[data-ref='enhanced-takeover-beta-desktop__dismiss-cta']")).click();


    // choose 20kg bags
    await driver.wait(until.elementLocated(By.css("ry-radio-circle-button[class='ry-radio-button'][data-at='outbound-all-PS-add']")));
    await driver.findElement(By.css("ry-radio-circle-button[class='ry-radio-button'][data-at='outbound-all-PS-add']")).click();
    await driver.findElement(By.css("span[data-at='outbound-all-BBG-add']")).click();


    // continue
    await driver.sleep(2000);
    await driver.findElement(By.css("button[data-ref='bags-continue-button']")).sendKeys(Key.ENTER);


    // skip extras
    await driver.sleep(2500);
    await driver.findElement(By.css('button[class="app-container__cta ry-button--gradient-yellow ry-button--large ng-star-inserted"]')).sendKeys(Key.ENTER);
    await driver.findElement(By.css('button[class="app-container__cta ry-button--gradient-yellow ry-button--large"]')).sendKeys(Key.ENTER);


    // check for login popup before payment
    await driver.sleep(500);
    await driver.wait(until.elementLocated(By.css('ry-auth-popup[class="auth-popup"]')))
    let loginPopup = await driver.findElement(By.css('div[class="dialog signup-dialog"]')).isDisplayed().then(function(value){
        return value
    });
    await driver.quit();
    return assert.strictEqual(loginPopup, true);
}


// mocha
describe("Verify a login popup is displayed before payment", function(){

    const tests = [
        {passengers: [2,2,2,2], destFrom:"DUB", destTo:"STN", flightDate: "2023-Oct-11"},
        {passengers: [3,0,0,2], destFrom:"Athens", destTo:"Katowice", flightDate: "2023-Jul-19"},
        {passengers: [2,0,0,0], destFrom:"Wroclaw", destTo:"Billund", flightDate: "2023-Sept-27"}
        
    ];

    tests.forEach(({passengers, destFrom, destTo, flightDate}) =>{
        it("successfully displays a login popup before payment", async function(){
            const result = await verifyPopup(passengers, destFrom, destTo, flightDate);
    });
    })
});



