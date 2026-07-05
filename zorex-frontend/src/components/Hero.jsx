import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Hero({ onShopNowClick, onCategoryClick }) {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
      title: "BIG BILLION FASHION DAYS",
      description: "Vibrant Streetwear & Ethnic Wear collections at 50% - 80% Off",
      btnText: "Shop Bestsellers",
      action: () => onShopNowClick()
    },
    {
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1200&q=80",
      title: "MEN'S CLOTHING HUB",
      description: "Classic shirts, hoodies, denims & more | Flat 40% Off",
      btnText: "Explore Men's Wear",
      action: () => onCategoryClick("Men's Clothing")
    },
    {
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80",
      title: "WOMEN'S CLOTHING HUB",
      description: "Elegant Kurtis, tops & street fashion | Flat 50% Off",
      btnText: "Explore Women's Wear",
      action: () => onCategoryClick("Women's Clothing")
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setActiveIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  return (
    <section className="hero">
      <div className="slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === activeIndex ? "active" : ""}`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="hero-text">
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <button onClick={slide.action}>
                <span>{slide.btnText}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-arrows">
        <button className="hero-arrow" onClick={handlePrev} aria-label="Previous slide">
          <ChevronLeft size={24} />
        </button>
        <button className="hero-arrow" onClick={handleNext} aria-label="Next slide">
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="hero-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`hero-dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </section>
  );
}
