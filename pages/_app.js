import '../styles/globals.css';
import React from 'react';
import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import ClientRouter from '../components/ClientRouter';

function userLoggedInFetch(app) {
    const fetchFunction = authenticatedFetch(app);

    return async (uri, options) => {
        const response = await fetchFunction(uri, options);

        if (
            response.headers.get(
                'X-Shopify-API-Request-Failure-Reauthorize',
            ) === '1'
        ) {
            const authUrlHeader = response.headers.get(
                'X-Shopify-API-Request-Failure-Reauthorize-Url',
            );

            const redirect = Redirect.create(app);
            redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
            return null;
        }

        return response;
    };
}

class MyApp extends App {
    render() {
        const { Component, pageProps, shopOrigin } = this.props;

        const config = { apiKey: API_KEY, shopOrigin, forceRedirect: true };
        return (
            <React.Fragment>
                <Head>
                    <title>XANA</title>
                    <meta charSet="utf-8" />
                </Head>
                <Provider config={config}>
                    <ClientRouter />
                    <AppProvider i18n={translations}>
                        <Component {...pageProps} />
                    </AppProvider>
                </Provider>
            </React.Fragment>
        );
    }
}

MyApp.getInitialProps = async ({ ctx }) => {
    return {
        shopOrigin: ctx.query.shop,
    };
};

export default MyApp;
