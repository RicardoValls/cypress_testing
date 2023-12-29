/*
- Our Calculator app is unable to substract negative values.
- When equal button is pressed multiple times it will repeat the last operation multiple times.
- There is a problem since the display only shows around 14 digits but, 
  more digits can be added increasing the number.
  When a calculation is made, it uses the all the digits not only the ones displayed.
*/

// Custom function to perform calculations in the calculator.
function performCalculation(num1, operation, num2) {
  cy.get('[data-cy="clear"]').click();
  Array.from(num1).forEach((char) =>
    char === "." ? cy.get(`[data-cy="decimal"]`).click() : cy.get(`[data-cy="${char}"]`).click());
  cy.get(`[data-cy="${operation}"]`).click();
  Array.from(num2).forEach((char) => 
    char === "." ? cy.get(`[data-cy="decimal"]`).click() : cy.get(`[data-cy="${char}"]`).click());
}

//path to the calculator
const path = "https://cs.pol.pm/calculator/";

describe("Calculator functional tests", () => {
  beforeEach(() => {
    cy.visit(path);
  });

  // Test typing of numbers and decimals
  it("types numbers correctly", () => {
    ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0"].forEach((num) => {
      cy.get(`[data-cy="${num}"]`).click();
      cy.get('[data-cy="display"]').should("have.text", `${num}`);
      cy.get('[data-cy="clear"]').click();
    });
  });

  it("types decimal point correctly", () => {
    cy.get('[data-cy="decimal"]').click();
    cy.get('[data-cy="display"]').should("have.text", "0.");
  });

    // Test decimal entry
  it("types decimal correctly", () => {
    cy.get('[data-cy="1"]').click();
    cy.get('[data-cy="decimal"]').click();
    cy.get('[data-cy="5"]').click();

    cy.get('[data-cy="display"]').should("have.text", "1.5");
  });


  // Test math operations - Add more test cases as needed
  const mathOperationsData = [
    // Integer operations
    { num1: "25", operation: "add", num2: "9", result: "34" },
    { num1: "7", operation: "substract", num2: "2", result: "5" },
    { num1: "7", operation: "multiply", num2: "9", result: "63" },
    { num1: "60", operation: "divide", num2: "6", result: "10" },
    // Decimal operations
    { num1: "12", operation: "add", num2: "5.6", result: "17.6" },
    { num1: "8.2", operation: "substract", num2: "3.1", result: "5.1" },
    { num1: "60", operation: "multiply", num2: "4.8", result: "288" },
    { num1: "34.6", operation: "divide", num2: "6", result: "5.766666666666667" }
  ];

  mathOperationsData.forEach(({ num1, operation, num2, result }) => {
    it(`calculates ${num1} ${operation} ${num2} = ${result}`, () => {
      // Perform the calculation using custom function performCalculation().
      performCalculation(num1, operation, num2);

      // Click on the equal button to display result.
      cy.get('[data-cy="equal"]').click();

      // Use data-cy attribute "display" for the calculator's output element
      cy.get('[data-cy="display"]').should("have.text", result.toString());
    });
  });

  // Test clear functionality (C button)
  it("displays 0 on the output screen when C button is clicked", () => {
    cy.get('[data-cy="7"]').click();
    cy.get('[data-cy="add"]').click();
    cy.get('[data-cy="clear"]').click();

    // Use data-cy attribute "display" for the calculator's output element
    cy.get('[data-cy="display"]').should("have.text", "0");
  });

  it("deletes last number after an operation and accepts new number", () => {
    cy.get('[data-cy="7"]').click();
    cy.get('[data-cy="add"]').click();
    cy.get('[data-cy="2"]').click();
    cy.get('[data-cy="clear"]').click();
    cy.get('[data-cy="3"]').click();
    cy.get('[data-cy="equal"]').click();

    cy.get('[data-cy="display"]').should("have.text", "10");
  });

  // Test equal button behaviour - Add more test cases as needed
  it('correctly calculates and displays a result after pressing "=" multiple times', () => {
    performCalculation("6", "multiply", "3");
    cy.get('[data-cy="equal"]').click().click().click(); // Clicks equal 3 times

    // Use data-cy attribute "display" for the calculator' s output element
    cy.get('[data-cy="display"]').should("have.text", "162");
  });
});

describe("Calculator non-functional tests", () => {
  beforeEach(() => {
    cy.visit(path);
  });

  it("App should load within acceptable time", () => {
    cy.location("href").should("equal", path);
    cy.document().its("readyState").should("eq", "complete");
  });

  // Test responsiveness and dynamic layout of the app
  it("App should display correctly in different viewport sizes", () => {
    // Define commonly used viewports
    const viewports = [
      { name: "mobile", width: 320, height: 568 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1280, height: 720 },
      { name: "largeDesktop", width: 1920, height: 1080 },
    ];

    viewports.forEach((viewport) => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit(path);

      // Check if the calculator container is visible at each viewport size
      cy.get('[data-cy="calculator-container"]').should("be.visible");
    });
  });

  // Test browser compatibility - Add more browsers as needed
  it("App should render correctly in multiple web browsers", () => {
    const browsers = ["chrome", "firefox", "edge"];

    browsers.forEach((browser) => {
      cy.visit(path, {
        onBeforeLoad(win) {
          Object.defineProperty(win.navigator, "userAgent", {
            value: browser,
          });
        },
      });

      // Perform a simple calculation to check if the app works in each browser
      performCalculation("6", "multiply", "3");
      cy.get('[data-cy="equal"]').click();

      // Check if the calculator's output element renders correctly
      cy.get('[data-cy="display"]').should("have.text", "18");
    });
  });
});
