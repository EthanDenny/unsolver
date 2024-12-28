import { MathJax } from 'mathjax'

export default mathjaxSetup = () => {
    MathJax.init({
        loader: {load: ['input/tex', 'output/svg'], inlineMath: [ ['$','$']]}
      }).then((MathJax) => {
        console.log("start svg")
        const svg = MathJax.tex2svg('42', {display: true});
        return svg
      }).catch((err) => console.log(err.message));
}

