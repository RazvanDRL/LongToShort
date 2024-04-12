let text = "Hello, world. This is a test;";
let punctuationChars = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
;
console.log(punctuationChars); // Output: [",", ".", ";"]