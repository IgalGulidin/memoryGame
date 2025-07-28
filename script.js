$(document).ready(function () {
  const MAX_CARDS = 12;
  let lockBoard = false;
  let hasCardFlipped = false;
  let firstCard, secondCard;
  let matchCount = 0;

  const themes = {
    harry: {
      url: "https://hp-api.onrender.com/api/characters",
      process: (data) => data.map((char) => char.image).filter(Boolean),
      backImage: "img/HarryPotter.JPEG",
    },
    flags: {
      url: "https://restcountries.com/v3.1/all?fields=flags",
      process: (data) =>
        shuffle(data.map((f) => f.flags?.png).filter(Boolean)).slice(0, 6),
      backImage: "img/flags.JPEG",
    },
    dogs: {
      url: "https://dog.ceo/api/breeds/image/random/12",
      process: (data) => data.message,
      backImage: "img/dogs.JPEG",
    },
  };
  $(".memoryGame").hide();

  $(".themeSelection").on("click", "[data-theme]", function () {
    const selectedTheme = $(this).data("theme");

    if (selectedTheme === "random") {
      const themeKeys = Object.keys(themes);
      const randomKey = themeKeys[Math.trunc(Math.random() * themeKeys.length)];
      loadGame(randomKey);
    } else {
      loadGame(selectedTheme);
    }
  });

  function loadGame(theme) {
    matchCount = 0;
    lockBoard = false;
    hasCardFlipped = false;
    firstCard, secondCard;

    $(".header").hide();
    $(".themeSelection").hide();
    $(".memoryGame").show().empty();

    const { url, process, backImage } = themes[theme];

    $.get(url, function (data) {
      let images = process(data);
      images = shuffle(images).slice(0, 6);
      const pairedImages = shuffle([...images, ...images]);

      pairedImages.forEach((src) => {
        const extraClass = theme === "flags" ? "flagCard" : "";
        $(".memoryGame")
          .append(`<div class="memoryCard ${extraClass}" data-card="${src}">
                <div class="frontFace">
                <img src="${src}" alt="Front image">
                </div>
                <div class="backFace">
                <img src="${backImage}" alt="Back image">
                </div>
                </div>
                `);
      });

      $(".memoryCard").each(function () {
        const randomPosition = Math.trunc(Math.random() * MAX_CARDS);
        this.style.order = randomPosition;
      });
    });
  }

  function handleCardFlip() {
    if (lockBoard || this === firstCard || $(this).hasClass("matched")) return;

    this.classList.add("flip");

    if (!hasCardFlipped) {
      hasCardFlipped = true;
      firstCard = this;
      return;
    }

    secondCard = this;
    lockBoard = true;

    checkForMatch();
  }

  function checkForMatch() {
    const isMatch = $(firstCard).data("card") === $(secondCard).data("card");
    isMatch ? disableMatchedCards() : unflipCards();
  }

  function disableMatchedCards() {
    $(firstCard).addClass("matched matchingBorder");
    $(secondCard).addClass("matched matchingBorder");

    matchCount++;

    if (matchCount === MAX_CARDS / 2) {
      setTimeout(() => {
        $(".memoryGame").hide();
        $(".winMessage").fadeIn();
      }, 800);
    }

    resetTurn();
  }

  function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
      $(firstCard).removeClass("flip");
      $(secondCard).removeClass("flip");
      resetTurn();
    }, 1500);
  }

  function resetTurn() {
    [hasCardFlipped, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
  }

  function shuffle(array) {
    return array.sort(() => 0.5 - Math.random());
  }

  $(".playAgainBtn").on("click", () => {
    $(".winMessage").hide();
    $(".themeSelection").fadeIn();
    $(".header").fadeIn();
    matchCount = 0;
    lockBoard = false;
    hasCardFlipped = false;
    [firstCard, secondCard] = [null, null];
  });
  $(".memoryGame").on("click", ".memoryCard", handleCardFlip);
});
