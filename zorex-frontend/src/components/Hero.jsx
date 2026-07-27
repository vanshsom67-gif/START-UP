import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";

export default function Hero({ onShopNowClick, onCategoryClick }) {
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85",
      badge: "AUTUMN / WINTER '26",
      title: "LUXURY STREETWEAR EDIT",
      description: "Discover curated high-fashion silhouettes, oversized outerwear & signature ethnic couture.",
      btnText: "Explore Collection",
      action: () => onShopNowClick()
    },
    {
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85",
      badge: "EXECUTIVE MEN'S WEAR",
      title: "MODERN TAILORED SUITS & JACKETS",
      description: "Elevate your daily statement with crisp linen shirts, urban hoodies & premium denims.",
      btnText: "Shop Men's Wear",
      action: () => onCategoryClick("Men's Clothing")
    },
    {
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=85",
      badge: "EDITORIAL WOMEN'S WEAR",
      title: "ELEGANT ETNIC & HIGH-STREETWEAR",
      description: "Sophisticated designer kurtis, evening gowns & contemporary women's apparel up to 60% off.",
      btnText: "Shop Women's Wear",
      action: () => onCategoryClick("Women's Clothing")
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);

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
              backgroundImage: `linear-gradient(to right, rgba(10, 10, 15, 0.85) 0%, rgba(10, 10, 15, 0.4) 60%, rgba(10, 10, 15, 0.2) 100%), url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="hero-text">
              <div className="hero-badge">
                <Sparkles size={12} /> {slide.badge}
              </div>
              <h1>{slide.title}</h1>
              <p>{slide.description}</p>
              <button className="hero-cta-btn" onClick={slide.action}>
                <span>{slide.btnText}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hero-arrows">
        <button className="hero-arrow" onClick={handlePrev} aria-label="Previous slide">
          <ChevronLeft size={22} />
        </button>
        <button className="hero-arrow" onClick={handleNext} aria-label="Next slide">
          <ChevronRight size={22} />
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

