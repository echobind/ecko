![Ecko](./docs/ecko.png)

> Mock any API for testing and development.

Most testing libraries offer the ability to mock external requests. But what if
your tests are running on a client and you need to mock requests that the server
is making? Or what if you're testing a CLI script by executing it and you need
to mock requests that the script makes?

Ecko is an http server that allows you to register endpoints and responses, and
then any requests made to those endpoints will return the responses you defined.
This essentially lets you mock any third-party service in a way that can be used
by code running in any context in your tests.

## How does it work

See [the tests](./tests/all.test.ts) for examples of how to use Ecko.

## Contributing

See the the [Contributing](./contributing.md) doc for how to contribute.

## Install

```bash
npm install ecko
```

## Release

```bash
npm run local-release
```

## Examples

- [Mocking the Stripe API](./tests/stripe-example.test.ts)
