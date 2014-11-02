window.FuncUtils = {
  stringToFunction: function(str) {
      var arr = str.split(".");

      var fn = (window || this);
      for (var i = 0, len = arr.length; i < len; i++) {
          fn = fn[arr[i]];
      }

      if (typeof fn !== "function") {
          alert("function not found");
      }

      return  fn;
  },

  //Standard matching function for use by typeahead.bundle.js
  substringMatcher: function(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex;

      matches = [];

      substrRegex = new RegExp(q, 'i');
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          matches.push({ value: str });
        }
      });

      cb(matches);
    };
  }
};
