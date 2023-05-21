const initialWidth = window.innerWidth;

const app = () => {
  console.log('moved');
  const headerTitleEl = document.querySelector('.header__title');
  const articleTitleEl = document.querySelector('.article__title');

  if (window.innerWidth < 1280) {
    headerTitleEl.textContent = 'Облачный колл-центр «Атлант»';
    articleTitleEl.classList.remove('article__title--big-padding-top');
    console.log(articleTitleEl.classList);
    console.log(initialWidth);
  } else {
    headerTitleEl.textContent = 'Автоматизации в сфере ЖКХ «ЖилфондСервис»';
  }
};

window.addEventListener('resize', () => {
  if (window.innerWidth !== initialWidth) {
    app();
  }
});

app();
