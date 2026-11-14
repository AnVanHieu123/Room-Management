import { Twitter, Facebook, Instagram, Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300 py-12">
            <div className="w-[90%] max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                {/* Cột 1 - Giới thiệu */}
                <div>
                    <h3 className="text-white font-bold mb-4 text-xl flex items-center gap-2">
                        <span className="text-orange-500">🏠</span> Nhà Tốt
                    </h3>
                    <p className="text-sm mb-6 leading-relaxed">
                        Nền tảng tìm kiếm và cho thuê phòng trọ uy tín hàng đầu Việt Nam. Kết nối chủ nhà và người thuê
                        một cách nhanh chóng, an toàn và minh bạch.
                    </p>
                    <div className="flex space-x-3">
                        <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors">
                            <Facebook size={18} />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="p-2 rounded-full bg-gray-800 hover:bg-orange-500 transition-colors">
                            <Twitter size={18} />
                        </a>
                    </div>
                </div>

                {/* Cột 2 - Liên hệ */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Liên hệ</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-center gap-2">
                            <MapPin size={16} className="text-orange-500" />
                            123 Nguyễn Phong Sắc, Cầu Giấy, Hà Nội
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone size={16} className="text-orange-500" />
                            0904792860
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail size={16} className="text-orange-500" />
                            hotro@phongtro.vn
                        </li>
                        <li className="flex items-center gap-2">
                            <Clock size={16} className="text-orange-500" />
                            08:00 - 21:00 (Thứ 2 - Chủ nhật)
                        </li>
                    </ul>
                </div>

                {/* Cột 3 - Khu vực phổ biến */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Khu vực phổ biến</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">
                            • Phòng trọ Nguyên Xá
                        </li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Phòng trọ Cầu Giấy</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Phòng trọ Thủ Đức</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">
                            • Phòng trọ Bình Thạnh
                        </li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Phòng trọ Láng</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Phòng trọ Tân Mai</li>
                    </ul>
                </div>

                {/* Cột 4 - Hướng dẫn */}
                <div>
                    <h3 className="text-white font-semibold mb-4 text-lg">Hướng dẫn</h3>
                    <ul className="space-y-2 text-sm">
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">
                            • Cách đăng tin cho thuê
                        </li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Cách tìm phòng trọ</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Quy định đặt cọc</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Câu hỏi thường gặp</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Điều khoản sử dụng</li>
                        <li className="hover:text-orange-500 cursor-pointer transition-colors">• Chính sách bảo mật</li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800 mt-10 pt-6">
                <div className="w-[90%] max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">© 2024 PhòngTrọ. Tất cả quyền được bảo lưu.</p>
                    <p className="text-sm text-gray-500">Được phát triển với ❤️ tại Việt Nam</p>
                </div>
            </div>
        </footer>
    );
}
