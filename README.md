# Caddy

[![Build status](https://ci.appveyor.com/api/projects/status/tl95fkw53i6vpqd9/branch/master?svg=true)](https://ci.appveyor.com/project/yuriys-kentico/consultingtransfers)

The source code for Caddy backend and client.

## What is Caddy?

Caddy is a way to automate sending and receiving files (a process called a transfer) with customers. Caddy has a client at https://caddy.kentico.net/ and a backend, both hosted on Azure. The client uses the Azure Storage JavaScript SDK to transfer large files in a secure way. The backend handles creation, suspension, and notifications of transfers.
