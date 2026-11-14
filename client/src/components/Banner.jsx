import { useState } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import img1 from '../assets/images/img1.webp';
import img2 from '../assets/images/img2.webp';
import img3 from '../assets/images/img3.webp';
import img4 from '../assets/images/img4.webp';
import img5 from '../assets/images/img5.webp';
import img6 from '../assets/images/img6.webp';

// Custom Arrow Components
const NextArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
    >
        <ChevronRight size={24} className="text-gray-700" />
    </button>
);

const PrevArrow = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
    >
        <ChevronLeft size={24} className="text-gray-700" />
    </button>
);

function Banner() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const images = [img1, img2, img3, img4, img5, img6];

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        beforeChange: (current, next) => setCurrentSlide(next),
        customPaging: (i) => (
            <div
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i === currentSlide ? 'bg-orange-500 scale-110' : 'bg-white/70 hover:bg-white'
                }`}
            />
        ),
        dotsClass: 'slick-dots !bottom-6 !flex !justify-center !gap-2',
    };

    return (
        <div className="mt-6 mb-8">
            <div className="relative h-[490px] rounded-2xl overflow-hidden shadow-xl">
                <Slider {...settings}>
                    {images.map((img, index) => (
                        <div key={index} className="relative">
                            <div className="h-[490px]">
                                <img
                                    src={img}
                                    alt={`Banner ${index + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                            </div>
                        </div>
                    ))}
                </Slider>

                {/* Slide counter badge */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {currentSlide + 1} / {images.length}
                </div>
            </div>
        </div>
    );
}

export default Banner;
