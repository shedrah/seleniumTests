Automated test for Ryanair website. Test case for checking Login popup before payment.

Uses Selenium web-driver and Mocha.

Test is parameterized; there are input values that can be changed for each test:

• array of size 4 - containing number of adults, teens, children and infants respectively,

• departure airport,

• destination airport,

• date of flight.

Example test input

Given I search for a flight from "DUB" to "STN" on 11/10/2023 for 2 adults, 2 teens, 2infants and 1 children. When I proceed to pay with selected seats and 20kg bags added. Then login popup shows up.
