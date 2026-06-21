import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import ShopMap from '../components/Map/ShopMap';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaFacebookF, FaLine, FaInstagram } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

interface ContactPageProps {
  onLogout?: () => void;
}

const infoIconCls = 'mr-[15px] flex h-10 w-10 shrink-0 items-center justify-center rounded border border-[#333] bg-[#1a1a1a] text-[1.2rem] text-accent';
const socialIconCls = 'flex h-10 w-10 items-center justify-center rounded-full border border-[#444] text-[#ccc] no-underline transition-all duration-300 hover:border-accent hover:bg-accent hover:text-black';
const labelCls = 'mb-2 block text-[0.9rem] font-medium uppercase text-[#aaa]';
const inputCls = 'box-border w-full rounded border border-[#333] bg-[#0a0a0a] px-[15px] py-3 text-base text-white transition-all duration-300 focus:border-accent focus:bg-[#141414] focus:shadow-[0_0_10px_rgba(255,199,9,0.1)] focus:outline-none';

export default function ContactPage({ onLogout }: ContactPageProps) {
  const seo = {
    title: 'CONTACT US | GT7 MOTORSPORT',
    description: 'ติดต่อเรา นัดหมายบริการ หรือสอบถามข้อมูลเพิ่มเติม ทีมงาน GT7 Motor ยินดีให้บริการ',
  };

  const [formData, setFormData] = useState({ name: '', phone_number: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.message) {
      setError('กรุณากรอกข้อมูลที่จำเป็น (*) ให้ครบถ้วน');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');

      const result = await response.json();
      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', phone_number: '', subject: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err instanceof Error ? err.message : 'ไม่สามารถส่งข้อความได้ในขณะนี้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
      </Helmet>

      <Header onLogout={onLogout} />

      {/* Hero Header */}
      <div className="relative flex h-[250px] flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80')] bg-cover bg-center text-center md:h-[350px]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-[#050505]"></div>
        <div className="relative z-[2] px-5">
          <h1 className="m-0 text-[2.5rem] font-black italic uppercase text-white [text-shadow:0_0_20px_rgba(0,0,0,0.8)] md:text-[3.5rem]">GET IN <span className="text-accent">TOUCH</span></h1>
          <p className="mt-2.5 max-w-[600px] text-[1.1rem] text-[#ccc]">เราพร้อมให้คำปรึกษาและบริการที่ดีที่สุดสำหรับรถของคุณ</p>
        </div>
      </div>

      <div className="relative z-[2] mx-auto max-w-[1200px] px-5 py-[60px]">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.5fr]">

          {/* Left Column: Contact Info */}
          <div className="rounded-lg border border-[#222] border-l-4 border-l-accent bg-[#111] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <h2 className="mb-[30px] border-b border-[#333] pb-[15px] text-[1.5rem] font-bold uppercase text-white">Contact Information</h2>

            <div className="mb-[25px] flex items-start">
              <div className={infoIconCls}><FaMapMarkerAlt /></div>
              <div>
                <h4 className="m-0 mb-[5px] text-base uppercase text-[#ddd]">LOCATION</h4>
                <p className="m-0 text-[0.95rem] leading-[1.6] text-[#888]">GT7 MOTORSPORT (สำนักงานใหญ่)<br/>52/8 ถนนสายไหม แขวงสายไหม<br/>เขตสายไหม กรุงเทพฯ 10220</p>
              </div>
            </div>

            <div className="mb-[25px] flex items-start">
              <div className={infoIconCls}><FaPhoneAlt /></div>
              <div>
                <h4 className="m-0 mb-[5px] text-base uppercase text-[#ddd]">PHONE</h4>
                <p className="m-0 text-[0.95rem] leading-[1.6] text-[#888]">02-999-9999 (Office)<br/>081-888-8888 (Hotline)</p>
              </div>
            </div>

            <div className="mb-[25px] flex items-start">
              <div className={infoIconCls}><FaEnvelope /></div>
              <div>
                <h4 className="m-0 mb-[5px] text-base uppercase text-[#ddd]">EMAIL</h4>
                <p className="m-0 text-[0.95rem] leading-[1.6] text-[#888]">info@gt7motor.com<br/>support@gt7motor.com</p>
              </div>
            </div>

            <div className="mb-[25px] flex items-start">
              <div className={infoIconCls}><FaClock /></div>
              <div>
                <h4 className="m-0 mb-[5px] text-base uppercase text-[#ddd]">OPENING HOURS</h4>
                <p className="m-0 text-[0.95rem] leading-[1.6] text-[#888]">จันทร์ - เสาร์: 09:00 - 18:00 น.<br/>อาทิตย์: ปิดทำการ</p>
              </div>
            </div>

            <div className="mt-10 flex gap-[15px]">
              <a href="#" className={socialIconCls}><FaFacebookF /></a>
              <a href="#" className={socialIconCls}><FaLine /></a>
              <a href="#" className={socialIconCls}><FaInstagram /></a>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="relative rounded-lg border border-[#222] bg-[#111] p-10 before:absolute before:-right-px before:-top-px before:h-5 before:w-5 before:border-r-2 before:border-t-2 before:border-accent before:content-[''] after:absolute after:-bottom-px after:-left-px after:h-5 after:w-5 after:border-b-2 after:border-l-2 after:border-accent after:content-['']">
            <h2 className="mb-5 text-[1.5rem] font-bold uppercase text-white">SEND MESSAGE</h2>

            {success && <div className="mb-5 rounded border border-[#28a745] bg-[rgba(40,167,69,0.2)] p-[15px] text-center font-medium text-[#28a745]">✓ ส่งข้อความเรียบร้อยแล้ว! เจ้าหน้าที่จะติดต่อกลับเร็วๆ นี้</div>}
            {error && <div className="mb-5 rounded border border-[#dc3545] bg-[rgba(220,53,69,0.2)] p-[15px] text-center font-medium text-[#dc3545]">⚠ {error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="mb-5">
                <label className={labelCls}>YOUR NAME *</label>
                <input type="text" name="name" className={inputCls} value={formData.name} onChange={handleChange} placeholder="ชื่อ-นามสกุล" />
              </div>

              <div className="mb-5">
                <label className={labelCls}>PHONE NUMBER</label>
                <input type="tel" name="phone_number" className={inputCls} value={formData.phone_number} onChange={handleChange} placeholder="เบอร์โทรศัพท์" />
              </div>

              <div className="mb-5 lg:col-span-2">
                <label className={labelCls}>SUBJECT</label>
                <input type="text" name="subject" className={inputCls} value={formData.subject} onChange={handleChange} placeholder="เรื่องที่ต้องการติดต่อ" />
              </div>

              <div className="mb-5 lg:col-span-2">
                <label className={labelCls}>MESSAGE *</label>
                <textarea name="message" className={`${inputCls} min-h-[120px] resize-y`} value={formData.message} onChange={handleChange} placeholder="รายละเอียดข้อความ..."></textarea>
              </div>

              <div className="mb-5 lg:col-span-2">
                <button type="submit" className="w-full cursor-pointer border-none bg-accent px-[30px] py-[15px] text-base font-bold uppercase tracking-[1px] text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_5px_15px_rgba(255,199,9,0.4)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#333] disabled:text-[#666] disabled:shadow-none [clip-path:polygon(10px_0,100%_0,100%_calc(100%-10px),calc(100%-10px)_100%,0_100%,0_10px)]" disabled={loading}>
                  {loading ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Map Section */}
        <div className="group relative mt-[60px] rounded-lg border border-[#222] bg-[#111] p-2.5">
          <h2 className="mb-5 text-center text-[1.5rem] font-bold uppercase text-white">OUR LOCATION</h2>
          <div className="h-[450px] overflow-hidden rounded transition-[filter] duration-300 [filter:grayscale(100%)_invert(90%)] group-hover:[filter:grayscale(0%)]">
            <ShopMap
              lat={13.913889}
              lng={100.651944}
              zoom={16}
              markerTitle="GT7 MOTOR"
              address="52/8 ถนนสายไหม แขวงสายไหม เขตสายไหม กรุงเทพมหานคร 10220"
              height="100%"
            />
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
