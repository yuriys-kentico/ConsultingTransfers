const createTransferEndpoint = {
  endpoint: 'https://consultingtransfersus-functions.azurewebsites.net/caddy/transfers/create/us',
  key: 'VObOc9c9oCZBT4WlsGZ9zdgaQwvwGm4vQuaUTyxEnBTGRg5TJUTrRA=='
};

const fetchCaddyApi = async ({ url, key, data }) =>
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-functions-key': key,
      Authorization: `Bearer super secret key for list transfers`
    },
    body: data && JSON.stringify(data)
  });

const createTransfer = async data =>
  await fetchCaddyApi({
    url: createTransferEndpoint.endpoint,
    key: createTransferEndpoint.key,
    data
  });

const createTransferResponse = await createTransfer({
  name: '',
  customer: '',
  requester: '',
  template: 'support___filesystem_and_database'
});

let transfer = await createTransferResponse.json();

console.log(transfer.template);
