# ecmascript-proposals-json [![Build Status](https://travis-ci.org/azu/ecmascript-proposals-json.svg?branch=master)](https://travis-ci.org/azu/ecmascript-proposals-json)

- Get ECMAScript proposal list
    - https://github.com/tc39/dataset (2021-05-29+)
- Save the proposal list as json file to [static/data](static/data)
- Show diff between proposals

See also [tc39/proposals: Tracking ECMAScript Proposals](https://github.com/tc39/proposals).

## Online

See ECMAScript Proposal Diff Tool:

- <https://azu.github.io/ecmascript-proposals-json/>

:warning: [static/data](static/data) is updated everyday.
If you notice no-data at a day, please report it.

## Install

    npm install

## Usage

### Get latest json

    node get-proposal.js

### Diff

    node diff.js --before a.json --after b.json

### Website

    npm start

## Changelog

See [Releases page](https://github.com/azu/ecmascript-proposals-json/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm i -d && npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/azu/ecmascript-proposals-json/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- [github/azu](https://github.com/azu)
- [twitter/azu_re](https://twitter.com/azu_re)

## License

MIT © azu
