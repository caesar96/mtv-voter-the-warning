const puppeteer = require('puppeteer');
var votes_count = 1;
async function vote() {
    while (true) {
        // Launch the browser with incognito mode using --incognito argument
        const browser = await puppeteer.launch({
            headless: "new",
            args: ['--incognito'],
            defaultViewport: null
        });

        const page = await browser.newPage();

        await page.goto('https://www.mtv.com/vma/vote/push-performance-of-the-year', {
            waitUntil: 'networkidle2',
        });

        // Wait for the artist card to appear (The Warning)
        await page.waitForSelector('h3.chakra-heading');
        const artistCards = await page.$$eval('h3.chakra-heading', headings => {
            return headings.map(heading => heading.textContent.trim());
        });

        // Find the index of "The Warning" card
        const warningIndex = artistCards.indexOf('The Warning');
        if (warningIndex === -1) {
            console.error('The Warning card not found!');
            await browser.close();
            return;
        }

        // Get the Add Vote button corresponding to The Warning
        const addVoteButtons = await page.$$('button[aria-label="Add Vote"]');
        const addVoteButton = addVoteButtons[warningIndex];

        if (addVoteButton) {
            await addVoteButton.click();
        } else {
            console.error('Add Vote button not found!');
            await browser.close();
            return;
        }

        // Wait for the login dialog to appear and enter a random email
        await page.waitForSelector('input[type="email"]');
        const randomEmail = `tw_army_${Math.floor(Math.random() * 10000)}_${new Date().getTime()}@gmail.com`;
        console.log("Random email: ", randomEmail);

        // await wait(1);
        await page.type('input[type="email"]', randomEmail);

        // Find and click the "Log In" button
        const logInButton = await page.evaluateHandle(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.find(button => button.textContent.trim() === 'Log In');
        });
        await wait(1);
        await logInButton.click();

        // Wait for the dialog to close
        await page.waitForSelector('input[type="email"]', { hidden: true });

        // Click the "Add Vote" button 10 times
        for (let i = 0; i < 10; i++) {
            await addVoteButton.click();
        }

        // Wait for the submit dialog to appear
        await page.waitForSelector('div.chakra-modal__body');
        
        // Click the "Submit" button
        const submitButton = await page.$('button.chakra-button.css-ufo2k5');
        if (submitButton) {
            await wait(1);
            await submitButton.click();
            console.log("Voted :D")
        } else {
            console.error('Submit button not found!');
            await browser.close();
            return;
        }

        console.log("Total Votes: ", votes_count);
        votes_count += 1;

        // Wait 3 seconds before repeating
        await wait(3);

        // Close the browser
        await browser.close();

        
        // await await wait(5);
    }
}

vote().catch(console.error);

function wait(time = 1) {
    return new Promise(resolve => setTimeout(resolve, time * 1000));
}
