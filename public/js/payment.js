
app.component('payment', {
  templateUrl: 'views/payment.html',

  controller: function($http) {
    var ctrl = this;

    //this.currencies = ['USD', 'EUR', 'CNY'];
    this.currencies = [
      {type:'USD', symbol:'$'},
      {type:'EUR', symbol:'€'},
      {type: 'ILS', symbol: '₪'},
      {type:'GBP', symbol:'£'}
    ];

    
    this.change = function () {
      var curObj = this.currencies.find(obj => obj.type == ctrl.toCurr);
      ctrl.symbol = curObj.symbol;
      console.log(ctrl.toCurr);
    }

    this.$onInit = function () {
      this.price = 25;
      this.inCurr = 'USD'; // currency type to convert by
      this.symbol = '$';

      console.log(ctrl);
      ctrl.toCurr = 'USD'; 
      
      $http.get('https://api.fixer.io/latest?base=USD').then((curData, err) => {
        ctrl.rates = curData.data.rates;
        console.log(ctrl.rates);

        this.usdToForeignRates = {
          USD: 1,
          EUR: ctrl.rates.EUR, //0.840936804,
          ILS: ctrl.rates.ILS, //3.48577803,
          GBP: ctrl.rates.GBP, //0.7422307
        };

        this.convertCurrency = function convertCurrency() {
          var calc = this.price * this.usdToForeignRates[ctrl.toCurr] / this.usdToForeignRates[ctrl.inCurr];
          return Math.round(calc * 100) / 100; // round calc 2 decimal places
        };

      });
    }

    /*this.Pay = function() {
      var priceSpan = document.getElementById('priceSpan');

      var details = { 
        "price": priceSpan.innerHTML, //ctrl.price,
        "currency": ctrl.toCurr
      };

      $http.post('/pay', details).then(() => {
        alert("payed success!")
      });
    }*/
  }
});