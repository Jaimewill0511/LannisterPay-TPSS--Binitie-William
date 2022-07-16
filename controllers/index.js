class splitPayment {
  static async splitPaymentCompute(req, res, next) {
    try {
      const { ID, Amount, Currency, CustomerEmail, SplitInfo } = req.body;
      if (toString(ID).trim().length < 1 || isNaN(ID)) {
        return res.status(400).json("invalid ID!(ID must be a number)");
      }

      if (Amount < 1 || isNaN(Amount)) {
        return res.status(400).json("invalid Amount(Enter a number)!");
      }

      if (SplitInfo.length < 1 || SplitInfo.length > 20) {
        return res
          .status(400)
          .json(
            "invalid SplitInfo length( minimum of 1 split entity and a maximum of 20 entities)!"
          );
      }
      if (`${Currency} `.trim().length < 1 || !isNaN(Currency)) {
        return res.status(400).json("Enter a valid Currency Description!");
      }
      if (
        `${CustomerEmail} `.trim().length < 1 ||
        !`${CustomerEmail}`.includes("@")
      ) {
        return res.status(400).json("invalid email");
      }

      // initializing empty array according to the splitType
      const flatSplit = [];
      const percentageSplit = [];
      const ratioSplit = [];

      //array holding the final result to be returned
      const finalArray = []; //

      //set starting balance to the Amount in request body
      let balance = Amount;
      let totalRatio = 0;
      let ratioBalance = 0;

      // functions based on SplitType
      let balCalculation = (amount, value) => {
        return amount - value;
      };

      const flat = (amount, value) => {
        return value;
      };

      const percentage = (amount, value) => {
        return (value / 100) * amount;
      };

      // iterate through splitInfo and update the array for each splitType
      SplitInfo.forEach((info, index) => {
        switch (info.SplitType) {
          case "FLAT":
            flatSplit.push({ ...info, index });
            break;
          case "PERCENTAGE":
            percentageSplit.push({ ...info, index });
            break;
          case "RATIO":
            //get total ratio for all instances where splitType == radio
            totalRatio += Number(info.SplitValue);
            ratioSplit.push({ ...info, index });
            break;
          default:
            break;
        }
      });

      // form a new array based on order of precedence
      const splitTypesArray = [].concat(flatSplit, percentageSplit, ratioSplit);

      // loop through splitTypesArray and compute according to splitType
      for (let i = 0; i < splitTypesArray.length; i++) {
        const currentSplitInfo = splitTypesArray[i];
        // check to make sure balance or splitValue is not less than 0
        if (balance < 0 || currentSplitInfo.SplitValue < 0) {
          return res.status(500).json({
            error: "Incomputable SplitValue",
          });
        } else if (currentSplitInfo.SplitType === "FLAT") {
          balance = balCalculation(balance, currentSplitInfo.SplitValue);
          flat(balance, currentSplitInfo.SplitValue);
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: currentSplitInfo.SplitValue,
          };
          finalArray.push(data);
        } else if (currentSplitInfo.SplitType === "PERCENTAGE") {
          let result = percentage(balance, currentSplitInfo.SplitValue);
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: result,
          };
          finalArray.push(data);
          balance = balCalculation(balance, result);
          ratioBalance = balance;
        } else if (currentSplitInfo.SplitType === "RATIO") {
          const startingRatioBalance = ratioBalance;
          const result =
            (Number(currentSplitInfo.SplitValue) / totalRatio) *
            startingRatioBalance;
          if (result < 0)
            return res.status(400).json({
              message: "Split amount cannot be less than 0",
            });
          const data = {
            SplitEntityId: currentSplitInfo.SplitEntityId,
            Amount: result,
          };
          finalArray.push(data);
          balance = balCalculation(balance, result);
        }
      }
      if (balance < 0) {
        return res
          .status(400)
          .json({ message: "Total Balance after split cannot be less than 0" });
      }
      const response = {
        ID,
        Balance: balance,
        SplitBreakdown: finalArray,
      };

      return res.status(200).json(response);
    } catch (err) {
      res.status(500).json({
        response: "internal server error",
        error: err.message,
      });
    }
  }
}

module.exports = splitPayment;
