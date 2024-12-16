# AskDante: Total Work Time Calculator

![Logo](img/icon.png)

## Table of Contents
- [Description](#description)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Description
AskDante: Total Work Time Calculator is a Chrome extension designed to help users calculate their total work time and remaining time based on entries from the AskDante platform. It takes into account necessary breaks according to German labor laws to provide accurate work time calculations.

## Features
- **Automatic Time Calculation:** Automatically calculates total work time and remaining time based on time entries.
- **Support for Multiple Languages:** Recognizes time entry actions in English, German, and Dutch.
- **Customizable Display:** Options to show or hide total work time and remaining time in a popup interface.
- **Real-time Updates:** Automatically updates the time calculations as new entries are added.

## Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store](https://chrome.google.com/webstore).
2. Search for "AskDante: Total Work Time Calculator".
3. Click on "Add to Chrome".
4. Confirm the installation by clicking "Add extension".

### From Source Code
1. Download or clone this repository.
    ```sh
    git clone https://github.com/saedyousef/askdante-extension.git
    ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory where you cloned the repository.

## Usage
1. Navigate to the AskDante website.
2. The extension will automatically calculate the total work time and display it in a fixed position at the bottom right of the page.
3. Open the extension popup to customize the display settings:
    - Toggle "Show Total Working Time" to display or hide the total work time.
    - Toggle "Show Remaining Time" to display or hide the remaining time.

## Development
### Prerequisites
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)

### Setup
1. Clone the repository.
    ```sh
    git clone https://github.com/saedyousef/askdante-extension.git
    ```
2. Navigate to the project directory.
    ```sh
    cd askdante-extension
    ```
3. Install the dependencies.
    ```sh
    npm install
    ```

### Build
1. Run the build command.
    ```sh
    npm run build
    ```

### Testing
1. Run the tests.
    ```sh
    npm test
    ```

## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
- **Saed Yousef**
- **Email:** me@saedyousef.com
- **GitHub:** [saedyousef](https://github.com/saedyousef)

