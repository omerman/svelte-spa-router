/*eslint-env mocha */

const assert = require('assert')

describe('<Router> component', function() {
    // Increase timeouts
    this.slow(2000)
    this.timeout(3000)

    it('renders on the page', (browser) => {
        browser
            .url(browser.launchUrl)
            .expect.element('body').to.be.present.before(1000)

        browser
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')

        browser.end()
    })

    it('current path appears', (browser) => {
        browser
            .url(browser.launchUrl)
            .waitForElementVisible('#currentpath')
            .expect.element('#currentpath').text.to.equal('/')

        browser.end()
    })

    it('selecting route from hash', (browser) => {
        // Main route
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Home!')
            .expect.element('#currentpath').text.to.equal('/')
        browser.expect.element('#currentqs').text.to.equal('')

        // /wild
        browser
            .url(browser.launchUrl + '/#/wild')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild')
        browser.expect.element('#currentqs').text.to.equal('')

        // /hello/svelte
        browser
            .url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('loading page with hash', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('refreshing page', (browser) => {
        // /hello/svelte
        browser
            .url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('')
        
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')
                browser.expect.element('#currentqs').text.to.equal('')

                browser.end()
            })
    })

    it('catch-all route', (browser) => {
        browser
            .url(browser.launchUrl + '/#/does/not/exist')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'NotFound')
            .expect.element('#currentpath').text.to.equal('/does/not/exist')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('clicking on link', (browser) => {
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')

                browser
                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')

                browser.end()
            })
    })

    it('clicking link with children', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/world')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links li a b', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Home!')
                    .expect.element('#currentpath').text.to.equal('/brand')
                browser.expect.element('#currentqs').text.to.equal('')
            })
    })

    it('back and forward buttons', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/svelte/user')
            .waitForElementVisible('ul.navigation-links')
            .expect.element('#nameparams').text.to.equal('Your name is: svelte user')

        // Click on link
        browser
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                browser
                    .waitForElementVisible('#nameparams')
                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')

                // Hit back button
                browser
                    .back(() => {
                        browser
                            .waitForElementVisible('#nameparams')
                            .expect.element('#nameparams').text.to.equal('Your name is: svelte user')

                        // Hit the forward button
                        browser
                            .forward(() => {
                                browser
                                    .waitForElementVisible('#nameparams')
                                    .expect.element('#nameparams').text.to.equal('Your name is: svelte')

                                browser.end()
                            })
                    })
            })
    })

    it('push method', (browser) => {
        browser
            .url(browser.launchUrl + '/#/')
            .waitForElementVisible('p.navigation-buttons')
            .click('.navigation-buttons button:nth-of-type(1)', () => {
                browser
                    .waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Wild')
                    .expect.element('#currentpath').text.to.equal('/wild/something')

                browser.url((url) => {
                    assert.equal(url.value, 'http://localhost:5000/#/wild/something')

                    browser.end()
                })
            })
    })

    it('pop method', (browser) => {
        // Click on link
        browser
            .url(browser.launchUrl + '/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                // Pop button
                browser
                    .waitForElementVisible('p.navigation-buttons')
                    .click('.navigation-buttons button:nth-of-type(2)', () => {
                        browser
                            .waitForElementVisible('h2.routetitle')
                            .assert.containsText('h2.routetitle', 'Wild')
                            .expect.element('#currentpath').text.to.equal('/wild/something')

                        browser.url((url) => {
                            assert.equal(url.value, 'http://localhost:5000/#/wild/something')

                            browser.end()
                        })
                    })
            })
    })

    it('replace method', (browser) => {
        // Click on link
        browser
            .url(browser.launchUrl + '/#/wild/something')
            .waitForElementVisible('ul.navigation-links')
            .click('.navigation-links a[href="#/hello/svelte"]', () => {
                // Replace button
                browser
                    .waitForElementVisible('p.navigation-buttons')
                    .click('.navigation-buttons button:nth-of-type(3)', () => {
                        browser
                            .waitForElementVisible('h2.routetitle')
                            .assert.containsText('h2.routetitle', 'Wild')
                            .expect.element('#currentpath').text.to.equal('/wild/replaced')

                        browser.url((url) => {
                            assert.equal(url.value, 'http://localhost:5000/#/wild/replaced')

                            // Pop button
                            browser
                                .waitForElementVisible('p.navigation-buttons')
                                .click('.navigation-buttons button:nth-of-type(2)', () => {
                                    browser
                                        .waitForElementVisible('h2.routetitle')
                                        .assert.containsText('h2.routetitle', 'Wild')
                                        .expect.element('#currentpath').text.to.equal('/wild/something')

                                    browser.url((url) => {
                                        assert.equal(url.value, 'http://localhost:5000/#/wild/something')

                                        // Ugh the callback hell...
                                        browser.end()
                                    })
                                })
                        })
                    })
            })
    })

    it('querystring from hash', (browser) => {
        // /hello/svelte?search=query&sort=0
        browser
            .url(browser.launchUrl + '/#/hello/svelte?search=query&sort=0')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Hi there!')
            .expect.element('#currentpath').text.to.equal('/hello/svelte')
        browser.expect.element('#currentqs').text.to.equal('search=query&sort=0')

        // Refresh the page
        browser
            .refresh(() => {
                browser.waitForElementVisible('h2.routetitle')
                    .assert.containsText('h2.routetitle', 'Hi there!')
                    .expect.element('#currentpath').text.to.equal('/hello/svelte')
                browser.expect.element('#currentqs').text.to.equal('search=query&sort=0')

                browser.end()
            })
    })

    it('routeLoaded event', (browser) => {
        browser
            .url(browser.launchUrl)
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Home","path":"/","location":"/","querystring":""}')

        browser.url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Home","path":"/","location":"/","querystring":""}\nrouteLoaded - {"name":"Name","path":"/hello/:first/:last?","location":"/hello/svelte","querystring":""}')

        browser.end()
    })

    it('routeEvent event', (browser) => {
        // Click on the p that triggers a "routeEvent" event
        browser.url(browser.launchUrl + '/#/hello/svelte')
            .waitForElementPresent('p#nameparams')
            .waitForElementPresent('#logbox')
            .click('p#nameparams', () => {
                browser
                    .waitForElementPresent('#logbox')
                    .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Name","path":"/hello/:first/:last?","location":"/hello/svelte","querystring":""}\nrouteEvent - {"action":"hi","params":{"first":"svelte","last":null}}')
                
                browser.end()
            })

    })

    it('route conditions', (browser) => {
        // Condition always passes
        browser
            .url(browser.launchUrl + '/#/lucky?pass=1')
            .waitForElementVisible('#lucky')
            .expect.element('#currentpath').text.to.equal('/lucky')
        browser.expect.element('#lucky').text.to.equal('You\'re in!')

        // Condition always fails
        browser.url(browser.launchUrl + '/#/lucky?pass=0')
            .waitForElementVisible('h2.routetitle')
            .assert.containsText('h2.routetitle', 'Wild')
            .expect.element('#currentpath').text.to.equal('/wild/conditions-failed')
        browser.expect.element('#currentqs').text.to.equal('')

        browser.end()
    })

    it('conditionsFailed event', (browser) => {
        // Condition always passes
        browser
            .url(browser.launchUrl + '/#/lucky?pass=1')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Lucky","path":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"}}')

        // Condition always fails
        browser.url(browser.launchUrl + '/#/lucky?pass=0')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Lucky","path":"/lucky","location":"/lucky","querystring":"pass=1","userData":{"foo":"bar"}}\nconditionsFailed - {"name":"Lucky","path":"/lucky","location":"/lucky","querystring":"pass=0","userData":{"foo":"bar"}}\nrouteLoaded - {"name":"Wild","path":"/wild/*","location":"/wild/conditions-failed","querystring":""}')

        browser.end()
    })

    it('parameter URL-decoding', (browser) => {
        browser
            .url(browser.launchUrl + '/#/hello/Mr%20Smith')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
        browser.expect.element('#currentpath').text.to.equal('/hello/Mr%20Smith')
        browser.expect.element('#nameparams').text.to.equal('Your name is: Mr Smith')

        // Invalid URL-encoded characters, should catch the exception
        browser
            .url(browser.launchUrl + '/#/hello/Mr%2%0Smith')
            .waitForElementVisible('#currentpath')
            .waitForElementVisible('h2.routetitle')
        browser.expect.element('#currentpath').text.to.equal('/hello/Mr%2%0Smith')
        browser.expect.element('#nameparams').text.to.equal('Your name is: null')
        browser.end()
    })

    it('use:link vars', (browser) => {
        // Condition always passes
        browser
            .url(browser.launchUrl + '/#/catalog/3')
            .waitForElementPresent('#logbox')
            .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Catalog","path":"/catalog/:id?","location":"/catalog/3","querystring":""}')
        browser.expect.element('#previous').attribute('href').to.endsWith('#/catalog/2')
        browser.expect.element('#next').attribute('href').to.endsWith('#/catalog/4')
        browser.click('#next', () => {
            browser.waitForElementVisible('#logbox')
                .expect.element('#logbox').text.to.equal('routeLoaded - {"name":"Catalog","path":"/catalog/:id?","location":"/catalog/3","querystring":""}\nrouteLoaded - {"name":"Catalog","path":"/catalog/:id?","location":"/catalog/4","querystring":""}')
            browser.expect.element('#previous').attribute('href').to.endsWith('#/catalog/3')
            browser.expect.element('#next').attribute('href').to.endsWith('#/catalog/5')
        })
        browser.end()
    })
})
