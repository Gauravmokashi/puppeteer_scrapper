const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Initializing Browser...')
    
    const browser = await puppeteer.launch({ headless: true }); //Browser is initiated here
    const page = await browser.newPage(); // Opened a new page
    
    console.log("Broser Initialize successfully ..! \nLoading webpage...")

    await page.goto('https://en.wikipedia.org/wiki/Lists_of_airports', { waitUntil: 'domcontentloaded' }); // Navigated to given URL and waiting for page to load
    const characters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    console.log("Webpage loaded ..! \nScrapping in progress...")

    var singlePageData;
    var data = [];
    for (let i = 0; i < characters.length; i++) {
        let element = await page.$x(`//a[text()="${characters[i]}"]`)
        await element[0].click(); // Looping and clicking on each List of airports A-Z
        await page.waitForNavigation(); // Waiting for navigation and page load

        // Looking for a table on the page
        singlePageData = await page.$$eval('table tbody tr', (trow) => {
            let rowData = [];

            // Looping on a row of table and assigning each cell value to object key
            trow.forEach(row => {
                let dataObj: any = { 'iata': '', 'icao': '', 'airport_name': '', 'location_served': '' };
                //@ts-ignore
                const tdList = Array.from(row.querySelectorAll('td'), column => column.innerText);

                dataObj.iata = tdList[0];
                dataObj.icao = tdList[1];
                dataObj.airport_name = tdList[2] == undefined ? '' : tdList[2].split(',').join('_').split(' ').join('_').replace(/[0-9]/g, 'DAPI').toLowerCase();
                dataObj.location_served = tdList[3] == undefined ? '' : tdList[3].split(',').join('_').split(' ').join('_').replace(/[0-9]/g, 'DAPI').toLowerCase();

                if (dataObj.airport_name != "" && dataObj.location_served != "") rowData.push(dataObj);
            });
            return rowData;
        });
        // Here we get single page array. We are then looping and pushing each object inside main data array
        singlePageData.forEach(element => {
            data.push(element);
        });
    }
    await browser.close(); // Closing the browser

    let fileName = "airport.json";

    // Creating a json file and saving all the data within it
    fs.writeFile(fileName, JSON.stringify(data, null, 2), (err) => {
        if (err) { console.log(err) }
        else { console.log(`Scrapping done ..! \nSaved Successfully in ${fileName}`) }
    });
})();