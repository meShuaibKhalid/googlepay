// // to get current year
// function getYear() {
//     var currentDate = new Date();
//     var currentYear = currentDate.getFullYear();
//     document.querySelector("#displayYear").innerHTML = currentYear;
// }

// getYear();


// /** google_map js **/
// function myMap() {
//     var mapProp = {
//         center: new google.maps.LatLng(40.712775, -74.005973),
//         zoom: 18,
//     };
//     var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
// }

const popup = document.querySelector('#flower-popup');
if(popup) console.log("popup", popup);


const parsedUserInfo = {
    mid_country_code: 'US',
    currency: 'USD',
    amount: 1,
    merchantName: 'Flowers Shop', // @todo get from merchant
    merchantId: 'BCR2DN4TWDNNPWQX', // @todo get from merchant
    merchant_display_name: 'Flowers Shop'
}

const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

const cardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["MASTERCARD", "VISA"]
    },
    tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
            'gateway': 'truevo',
            'gatewayMerchantId': 'exampleGatewayMerchantId'
        }
    }
};

const {tokenizationSpecification, ...baseCardPaymentMethod } = cardPaymentMethod;

let paymentsClient = null;

function getGoogleIsReadyToPayRequest() {
    return Object.assign(
        {},
        baseRequest,
        {
            allowedPaymentMethods: [baseCardPaymentMethod]
        }
    );
};

function getGooglePaymentDataRequest() {
    return {
        ...baseRequest,
        allowedPaymentMethods: [cardPaymentMethod],
        transactionInfo: {
            countryCode: `${parsedUserInfo.mid_country_code}`,
            currencyCode: `${parsedUserInfo.currency}`,
            totalPriceStatus: "FINAL",
            totalPrice: `${parsedUserInfo.amount}`,
            totalPriceLabel: "Total"
        },
        merchantInfo: {
            merchantId: `${parsedUserInfo.merchantId}`,
            merchantName: `${parsedUserInfo.merchantName}`
        },
        callbackIntents: ["PAYMENT_AUTHORIZATION"]
    };
};

function getGooglePaymentsClient() {
    if (paymentsClient === null) {
        paymentsClient = new google.payments.api.PaymentsClient({
            environment: 'PRODUCTION',
            paymentDataCallbacks: {
                onPaymentAuthorized: onPaymentAuthorized
            }
        });
    }
    return paymentsClient;
};

function onPaymentAuthorized(paymentData) {
    return new Promise(function (resolve, reject) {
        // handle the response
        processPayment(paymentData)
            .then(function () {
                resolve({ transactionState: 'SUCCESS' });
            })
            .catch(function () {
                resolve({
                    transactionState: 'ERROR',
                    error: {
                        intent: 'PAYMENT_AUTHORIZATION',
                        message: 'Insufficient funds',
                        reason: 'PAYMENT_DATA_INVALID'
                    }
                });
            });
    });
};

function onGooglePayLoaded() {
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.isReadyToPay(getGoogleIsReadyToPayRequest())
        .then(function (response) {
            if (response.result) {
                addGooglePayButton();
            }
        })
        .catch(function (err) {
            // show error in developer console for debugging
            console.error(err);
        });
};


function addGooglePayButton() {
    const paymentsClient = getGooglePaymentsClient();
    const button =
        paymentsClient.createButton({
            onClick: onGooglePaymentButtonClicked,
            allowedPaymentMethods: [baseCardPaymentMethod]
        });
    document.getElementById('container').appendChild(button);
};


function onGooglePaymentButtonClicked() {
    const paymentDataRequest = getGooglePaymentDataRequest();

    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.loadPaymentData(paymentDataRequest);
};

function processPayment(paymentData) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            // @todo pass payment token to your gateway to process payment
            paymentToken = paymentData.paymentMethodData.tokenizationData.token;
            console.log('paymentToken: ', JSON.parse(paymentToken));

            resolve({});
        }, 3000);
    });
};