import { MathJax } from 'mathjax'

MathJax.init({
    loader: {load: ['input/tex', 'output/svg'], inlineMath: [ ['$','$']]}
  }).then((MathJax) => {
    console.log("start svg")
    const svg = MathJax.tex2svg('42', {display: true});

    var newSvg = document.getElementById('myDiv'); 
    newSvg.outerHTML+= svg
    console.log(svg)

    
  }).catch((err) => console.log(err.message));
