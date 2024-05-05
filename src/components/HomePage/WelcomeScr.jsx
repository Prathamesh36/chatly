import React from 'react'
import { useEffect } from 'react';
import './WelcomSrc.css'

const WelcomeScr = () => {

    useEffect(() => {
        const blockSize = 50;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const numCols = Math.ceil(screenWidth / blockSize);
        const numRows = Math.ceil(screenHeight / blockSize);
        const numBlocks = numCols * numRows;

        const createBlocks = () => {
            const blockContainer = document.getElementById("blocks");
            for (let i = 0; i < numBlocks; i++) {
                const block = document.createElement("div");
                block.classList.add("block");
                block.dataset.index = i;
                block.addEventListener("mousemove", highlightRandomNeighbors);
                blockContainer.appendChild(block);
            }
        };

        const highlightRandomNeighbors = function () {
            const index = parseInt(this.dataset.index);
            const neighbors = [
                index - 1,
                index + 1,
                index - numCols,
                index + numCols,
                index - numCols - 1,
                index - numCols + 1,
                index + numCols - 1,
                index + numCols + 1,
            ].filter(
                (i) =>
                    i >= 0 &&
                    i < numBlocks &&
                    Math.abs((i % numCols) - (index % numCols)) <= 1
            );

            this.classList.add("highlight");
            setTimeout(() => {
                this.classList.remove("highlight");
            }, 500);

            shuffleArray(neighbors).slice(0, 1).forEach((nIndex) => {
                const neighbor = document.getElementById("blocks").children[nIndex];
                if (neighbor) {
                    neighbor.classList.add("highlight");
                    setTimeout(() => {
                        neighbor.classList.remove("highlight");
                    }, 500);
                }
            });
        };

        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        };

        createBlocks();

        return () => {
            // Cleanup code if necessary
        };
    }, []);

    return (
        <div className="blocks-container h-[100vh] w-[100vw]">
            <div id="blocks"></div>
        </div>
    )
}

export default WelcomeScr