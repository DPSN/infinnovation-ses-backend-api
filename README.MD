![RESTful API Server](https://s4.postimg.org/o5ytba7j1/rest-api.jpg)
# Infinnovation Stock Exchange Simulator Backend API

https://sesapi.infinnovation.co/

A REST-ful API is used as the backend API server for Infinnovation Stock Exchange Simulator Apps. The backend API server is written in Node.js and runs on itself on the OpenShift platform. Only authenticated users with a valid API key can get access to the API.

[Infinnovation Stock Exchange Simulator](https://stockexchangesimulator.infinnovation.co) is a simulator app that simulates Infinnovation Virtual Stock Exchange.
A list of 40 stocks from NSE/BSE are to be used for the simulated stock exchange whose values are fluctuated by the virtual stock exchange's board members. The target audience of the app is participants of Infi-Invest at Infinnovation to provide them with real-time stock updates and thus, allowing them to view news, graphs, other relevant data on the regulated securities/stocks. All fluctuations to the values of the stocks are done through the master panel which is to be used only by the authorised members of the stock exchange board.

Please refer to this [project](https://github.com/DPSN/infinnovation-stock-exchange-simulator) for information about Infinnovation Stock Exchange Simulator Web App.

Both the web app as well as the backend API server shares a common database server.

An implementation of an iOS App using this backend API is linked beneath.

[iOS App Store Link](https://itunes.apple.com/us/app/infinnovation-stock-exchange/id1158873935?ls=1&mt=8)
