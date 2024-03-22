import React, { useEffect, useRef, useState } from "react";
import styles from "./app.module.css";
import { LuTimer, LuSkull, LuCaseSensitive, LuStar } from "react-icons/lu";
import { texts } from "./util/texts";

export default function App() {
  const [mistakes, setMistakes] = useState<number>(0);
  const [input, setInput] = useState<string>("");
  const [capsLock, setCapsLock] = useState<boolean>(false);

  const [currentText, setCurrentText] = useState<string>(texts[0]);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(30);
  const [timer, setTimer] = useState<number>(30);
  const [prevTextLength, setPrevTextLength] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);

  useEffect(() => {
    setCurrentText(texts[Math.floor(Math.random() * texts.length)]);

    const focusInput = () => {
      setIsFocused(true);
      inputRef.current?.focus();
    };

    const handleClick = () => inputRef.current?.focus();

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.getModifierState("CapsLock")) {
        setCapsLock(true);
      } else {
        setCapsLock(false);
      }
      focusInput();
    };

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.addEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isFocused && !isCompleted && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer <= 0) {
      setIsCompleted(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isFocused, isCompleted, timer]);

  useEffect(() => {
    setInput("");
  }, [currentText]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isCompleted || timer <= 0) return;

    let newValue = event.target.value;
    let currentMistakes = mistakes;

    if (!isCompleted && newValue.length > prevTextLength) {
      const lastTypedChar = newValue[newValue.length - 1];
      const correctChar = currentText[newValue.length - 1];
      if (lastTypedChar !== correctChar) {
        currentMistakes += 1;
        setMistakes(currentMistakes);
      }
    }

    if (input.length === currentText.length) {
      setCurrentText(texts[Math.floor(Math.random() * texts.length)]);
      newValue = "";
      setPrevTextLength(0);
    } else {
      setPrevTextLength(newValue.length);
    }

    setInput(newValue);
  };

  const countCorrectChars = (input: string, currentText: string): number => {
    let count = 0;
    const minLength = Math.min(input.length, currentText.length);

    for (let i = 0; i < minLength; i++) {
      if (input[i] === currentText[i]) {
        count++;
      } else {
        continue;
      }
    }

    return count;
  };

  const calculateWPM = (correctChars: number, duration: number): number => {
    if (correctChars === 0 || duration === 0) return 0;
    return Math.round((correctChars * 60) / duration / 5);
  };
  const finalWPM = calculateWPM(
    countCorrectChars(input, currentText),
    duration
  ); // Assuming final duration is 30 seconds
  const currentWPM = calculateWPM(
    countCorrectChars(input, currentText),
    duration - timer
  ); // Assuming timer is counting down from 30 seconds

  const calAccuracy = (correctChars: number, input: string): number => {
    if (correctChars === 0 || input.length === 0) return 0;
    return Math.round((correctChars / input.length) * 100);
  };

  const handleReplay = (): void => {
    handleClick();
    setIsFocused(false);
    setInput("");
    setMistakes(0);
    setIsCompleted(false);
    setTimer(duration);
    inputRef.current?.focus();
    setCurrentText(texts[Math.floor(Math.random() * texts.length)]);
  };

  useEffect(() => {
    handleReplay();
  }, [duration]);

  const handleClick = () => {
    setIsRotating(true);
    setTimeout(() => {
      setIsRotating(false);
    }, 500); // Adjust the timeout to match the animation duration
  };

  const renderText = (): JSX.Element[] => {
    const elements: JSX.Element[] = [];
    let inputIndex = 0;

    const textWords = currentText.split(/\s+/);
    textWords.forEach((word, wordIndex) => {
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const inputChar = input[inputIndex];
        const className =
          inputIndex < input.length
            ? inputChar === char
              ? styles.correctChar
              : styles.incorrectChar
            : styles.untypedChar;

        elements.push(
          <span key={`${wordIndex}-${i}`} className={className}>
            {char}
          </span>
        );
        inputIndex++;
      }

      if (wordIndex < textWords.length - 1) {
        elements.push(
          <span key={`space-${wordIndex}`} className={styles.spaceChar}>
            {" "}
          </span>
        );
        inputIndex++;
      }
    });

    return elements;
  };

  return (
    <div className="parent">
      <h1 className="text-[1.8rem] font-semibold text-center m-[3rem]">
        Typetest<span className="text-[#2DA1FF]">.io</span>
      </h1>
      <div className={styles.gameStatus}>
        <div className="gap-[30px] text-[20px]">
          <div className="gap-[5px]">
            <LuTimer className="text-[24px] text-[#007bff]" /> Timer{" "}
            <span>{timer} </span>
          </div>
          <div className="gap-[5px]">
            <LuSkull className="text-[24px] text-[#007bff]" /> Mistakes{" "}
            <span>{mistakes}</span>
          </div>
        </div>
        <div className="gap-[30px] text-[20px]">
          <div className="gap-[5px]">
            <LuStar className="text-[24px] text-[#007bff]" /> WPM{" "}
            <span>{currentWPM}</span>
          </div>

          <div className="gap-[5px]">
            <LuCaseSensitive className="text-[40px] text-[#007bff]" /> CapsLock{" "}
            <span>{capsLock ? "On" : "Off"}</span>
          </div>
        </div>
      </div>
      <div className="min-w-[300px] lg:max-w-[816px] px-9 py-6 bg-[#191919] rounded select-none text-sm md:text-base">
        {renderText()}
      </div>
      <input
        type="text"
        value={input}
        ref={inputRef}
        onChange={handleChange}
        className="sr-only"
        placeholder="Start typing..."
        readOnly={isCompleted}
      />
      <div className="flex flex-col w-full h-[58px] text-[40px] my-3 text-white gap-4 md:gap-2 md:flex-row md:justify-center md:items-center">
        <div className="flex flex-row w-full h-14 md:h-full gap-2">
          <div className="h-full w-20 m-1 ml-0 flex justify-center items-center rounded bg-[#191919] hover:bg-[#2d9efb]">
            <button
              onClick={handleReplay}
              className={`${
                isRotating ? "animate-spin" : ""
              } focus:outline-none`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5rem"
                height="1.5rem"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                >
                  <path d="M1 4v6h6m16 10v-6h-6"></path>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                </g>
              </svg>
            </button>
          </div>
          <div className="flex h-full w-full md:m-1 m-1 mr-0 pl-2 justify-center items-center rounded bg-[#191919] gap-1">
            <span className="text-xl lg:mx-auto ">Duration:</span>
            <ul className="flex items-center">
              <span
                className={`text-xl cursor-pointer m-1 lg:mr-0 lg:m-1 px-1 md:px-3 ${
                  duration === 15 ? "rounded-full bg-[#3f3f3f]" : ""
                }`}
                onClick={() => {
                  setDuration(15);
                }}
              >
                15
              </span>
              <span
                className={`text-xl cursor-pointer m-1 lg:mr-0 lg:m-1 px-1 md:px-3 ${
                  duration === 30 ? "rounded-full bg-[#3f3f3f]" : ""
                }`}
                onClick={() => {
                  setDuration(30);
                }}
              >
                30
              </span>
              <span
                className={`text-xl cursor-pointer m-1 lg:mr-0 lg:m-1 px-1 md:px-3 ${
                  duration === 45 ? "rounded-full bg-[#3f3f3f]" : ""
                }`}
                onClick={() => {
                  setDuration(45);
                }}
              >
                45
              </span>
              <span
                className={`text-xl cursor-pointer m-1 px-1 md:px-3 ${
                  duration === 60 ? "rounded-full bg-[#3f3f3f]" : ""
                }`}
                onClick={() => {
                  setDuration(60);
                }}
              >
                60
              </span>
            </ul>
          </div>
        </div>
        <div className="flex w-full h-14 md:h-full gap-2">
          <div className="flex h-full w-36 m-1 p-2 text-3xl justify-center items-center rounded bg-[#191919] gap-1">
            <span>
              {timer === 0 ? finalWPM : 0}{" "}
              <small className="text-[18px] font-normal">WPM</small>
            </span>
          </div>
          <div className="flex h-full w-full m-1 mr-0 text-xl justify-center items-center rounded bg-[#191919] gap-1">
            <span>
              Accuracy:{" "}
              {timer == 0
                ? calAccuracy(countCorrectChars(input, currentText), input)
                : 0}
              <small className="text-xl">{" %"}</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
