import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import * as featuredImageService from '../../services/featuredImageService';
import { getProductImage } from '../../utils/imageHelper';

/**
 * Hero Component
 * Carrusel de banners promocionales a ancho completo
 * Estilo Digicorp/Ubiquiti - Sin texto superpuesto
 */
const Hero = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const response = await featuredImageService.getAllActive();
            setBanners(response.data || []);
        } catch (error) {
            console.error('Error cargando banners:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mostrar loader mientras carga
    if (loading) {
        return (
            <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[750px] xl:h-[850px] bg-gray-200 animate-pulse" />
        );
    }

    // Si no hay banners, mostrar imagen por defecto
    if (banners.length === 0) {
        return (
            <section className="w-full">
                <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[750px] xl:h-[850px] bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                    <div className="text-center text-white px-6">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Business Kyla SRL</h2>
                        <p className="text-lg md:text-xl">Tecnología de Calidad para tu Empresa</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full">
            <Swiper
                modules={[Autoplay, Pagination, Navigation, EffectFade]}
                effect="fade"
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                pagination={{
                    clickable: true,
                }}
                navigation={true}
                loop={true}
                speed={1000}
                className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[750px] xl:h-[850px]"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner._id}>
                        <img
                            src={getProductImage(banner.image)}
                            alt={`Banner promocional ${banner._id}`}
                            className="w-full h-full object-contain bg-gray-100"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Hero;
