import React, { useState, useEffect, useRef } from "react";
import Card from "./Card";
import axios from "axios";

// API docs @ https://deckofcardsapi.com

const API_URI = "http://deckofcardsapi.com/api/deck"

const Deck = () => {
    const [deck, setDeck] = useState(null);
    const [autoDraw, setAutoDraw] = useState(false);
    const [drawn, setDrawn] = useState([]);
    const timerRef = useRef(null);

    // requesting deck from API and save in state "deck"
    useEffect(() => {
        axios.get(`${API_URI}/new/shuffle/`).then(res => {
            console.log(res.data)
            setDeck(res.data)
        })
    }, []);


    
    const toggleAutoDraw = () => {
        setAutoDraw(!autoDraw);
    }

    //draw card from deck_id and save in state "drawn"
    useEffect(() => {
    async function getCard() {
        let { deck_id } = deck;
        console.log(deck_id)
            try {
                let draw = await axios.get(`${API_URI}/${deck_id}/draw/?count=1`);
                if (draw.data.remaining === 0) {
                    setAutoDraw(false);
                    throw new Error("No card left in deck!");
                }
                const card = draw.data.cards[0];
                setDrawn(c => [...c,
                {
                    id: card.code,
                    name: card.suit + " " + card.value,
                    image: card.image
                }
                ]);
            }
            catch (e) {
                alert(e);
            }
    }
        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => await getCard(), 1000);
    } 
        //return cleanup function
        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, [setAutoDraw, autoDraw, deck]);

    let cards = drawn.map(c => (
        <Card key={c.id} name={c.name} source={c.image} />));

    return (
        <div>
            {deck ? <button onClick={toggleAutoDraw}>
                {autoDraw ? "STOP" : "START"} Auto-Draw!
                    </button> : null}
            <div>{cards}</div>
        </div>
    )
};

export default Deck;
