import { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    Sparkles,
    Trash2,
    RotateCcw,
    ExternalLink,
    Maximize2,
    Minimize2,
    User,
    CheckCircle2,
    Search,
    MapPin,
    DollarSign,
    FileText,
    ChevronRight,
    LogIn,
    PanelLeftClose,
    PanelLeftOpen,
    Home,
    ShieldAlert,
    Zap,
    CornerDownLeft,
} from 'lucide-react';
import { Popconfirm, message } from 'antd';
import { useStore } from '../hooks/useStore';
import {
    requestChatbot,
    requestGetMessageChatbot,
    requestClearMessageChatbot,
} from '../config/UserRequest';
import Cookies from 'js-cookie';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const SUGGESTION_CATEGORIES = [
    {
        title: 'Mức giá phổ biến',
        icon: <DollarSign size={16} className="text-emerald-500" />,
        items: [
            { label: 'Phòng trọ giá rẻ dưới 3 triệu', query: 'Tìm cho mình các phòng trọ có giá thuê dưới 3 triệu với' },
            { label: 'Căn hộ mini từ 3 - 5 triệu', query: 'Gợi ý các căn hộ mini, phòng cao cấp tầm giá 3 đến 5 triệu' },
            { label: 'Phòng ở ghép tiết kiệm chi phí', query: 'Có phòng nào phù hợp cho 2-3 người ở ghép để tiết kiệm chi phí không?' },
        ],
    },
    {
        title: 'Khu vực nổi bật',
        icon: <MapPin size={16} className="text-orange-500" />,
        items: [
            { label: 'Phòng trọ quận Cầu Giấy', query: 'Có phòng trọ nào ở khu vực quận Cầu Giấy đang còn trống không?' },
            { label: 'Phòng trọ quận Đống Đa', query: 'Tìm phòng trọ ở khu vực quận Đống Đa gần các trường đại học' },
            { label: 'Gần các trạm xe bus, đường lớn', query: 'Tìm phòng trọ nằm gần trục đường lớn, tiện xe bus đi lại' },
        ],
    },
    {
        title: 'Tiện ích & Quy trình',
        icon: <FileText size={16} className="text-blue-500" />,
        items: [
            { label: 'Phòng đủ điều hòa, máy giặt', query: 'Tìm phòng trọ khép kín đầy đủ điều hòa, bình nóng lạnh, máy giặt riêng' },
            { label: 'Giờ giấc tự do, không chung chủ', query: 'Tìm phòng trọ tự do giờ giấc, khóa vân tay, không chung chủ' },
            { label: 'Thủ tục đặt cọc & hợp đồng', query: 'Quy trình đặt cọc và những lưu ý quan trọng khi ký hợp đồng thuê trọ là gì?' },
        ],
    },
];

const QUICK_CHIPS = [
    { label: '🏷️ Dưới 3 triệu', query: 'Tìm phòng trọ giá dưới 3 triệu' },
    { label: '🏢 Căn hộ 3 - 5 triệu', query: 'Tìm căn hộ mini từ 3 đến 5 triệu' },
    { label: '📍 Quận Cầu Giấy', query: 'Phòng trọ còn trống ở Cầu Giấy' },
    { label: '📍 Quận Đống Đa', query: 'Phòng trọ khu vực quận Đống Đa' },
    { label: '❄️ Đủ điều hòa, nóng lạnh', query: 'Phòng có điều hòa, nóng lạnh, máy giặt' },
    { label: '🚪 Không chung chủ', query: 'Phòng trọ tự do giờ giấc, không chung chủ' },
    { label: '📋 Hợp đồng & đặt cọc', query: 'Lưu ý khi làm hợp đồng thuê phòng trọ' },
];

function ChatbotWidget() {
    const location = useLocation();
    const { dataUser } = useStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPromptHint, setShowPromptHint] = useState(true);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const isAdminRoute = location.pathname.startsWith('/admin');
    const isLoggedIn = Cookies.get('logged') === '1' || !!dataUser?._id;

    // Cuộn xuống cuối khung chat
    const scrollToBottom = (behavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom('auto');
            setTimeout(() => inputRef.current?.focus(), 250);
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Lắng nghe sự kiện bàn phím Escape để đóng modal, và CustomEvent 'open-chatbot'
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        const handleOpenEvent = () => {
            setIsOpen(true);
            setShowPromptHint(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('open-chatbot', handleOpenEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('open-chatbot', handleOpenEvent);
        };
    }, [isOpen]);

    // Tải lịch sử tin nhắn
    useEffect(() => {
        if (isLoggedIn) {
            fetchChatHistory();
        } else {
            setMessages([
                {
                    sender: 'bot',
                    content: `👋 Xin chào! Mình là **AI Trợ lý Tìm Phòng Trọ** (Powered by Groq AI).\n\nMình có thể hỗ trợ bạn tìm kiếm và so sánh phòng trọ thực tế trong hệ thống:\n• 🔍 **Tìm phòng** theo mức giá, khu vực, diện tích\n• 🛋️ **Tiện ích:** Điều hòa, nóng lạnh, máy giặt, gác lửng, giờ giấc tự do\n• 📋 **Thủ tục:** Đặt lịch xem phòng, tiền đặt cọc và hợp đồng thuê trọ\n\nBạn đang cần tìm căn phòng như thế nào? Hãy gõ câu hỏi hoặc chọn các gợi ý bên dưới nhé!`,
                    createdAt: new Date(),
                },
            ]);
        }
    }, [isLoggedIn]);

    const fetchChatHistory = async () => {
        try {
            const res = await requestGetMessageChatbot();
            if (res.metadata && res.metadata.length > 0) {
                setMessages(res.metadata);
            } else {
                setMessages([
                    {
                        sender: 'bot',
                        content: `👋 Chào mừng **${dataUser?.fullName || 'bạn'}** quay trở lại!\n\nMình là AI Trợ lý của hệ thống PhongTrọ. Bạn cần tìm kiếm phòng trọ, căn hộ hay cần tư vấn thông tin gì hôm nay?`,
                        createdAt: new Date(),
                    },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch chat history:', error);
        }
    };

    const handleSendMessage = async (textToSend) => {
        const queryText = (textToSend || input).trim();
        if (!queryText || loading) return;

        const userMsg = {
            sender: 'user',
            content: queryText,
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await requestChatbot({ question: queryText });
            const botContent = res.metadata?.content || res.metadata || 'Không có phản hồi từ máy chủ.';

            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    content: botContent,
                    createdAt: new Date(),
                },
            ]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi gọi Groq AI';
            message.error(errorMsg);
            setMessages((prev) => [
                ...prev,
                {
                    sender: 'bot',
                    content: `⚠️ **Lỗi:** ${errorMsg}`,
                    createdAt: new Date(),
                    isError: true,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!isLoggedIn) {
            setMessages([
                {
                    sender: 'bot',
                    content: '👋 Cuộc trò chuyện đã được làm mới. Bạn cần hỗ trợ tìm phòng nào tiếp theo?',
                    createdAt: new Date(),
                },
            ]);
            message.success('Đã làm mới cuộc hội thoại');
            return;
        }

        try {
            await requestClearMessageChatbot();
            setMessages([
                {
                    sender: 'bot',
                    content: '👋 Lịch sử chat đã được xóa. Mình có thể giúp gì cho bạn hôm nay?',
                    createdAt: new Date(),
                },
            ]);
            message.success('Đã xóa lịch sử chat thành công');
        } catch (error) {
            console.error('Clear chat history error:', error);
            message.error('Không thể xóa lịch sử lúc này');
        }
    };

    // Chuẩn hóa thẻ <br> thành dòng mới trước khi render Markdown
    const formatBotMessage = (content) => {
        if (!content) return '';
        return content.replace(/<br\s*\/?>/gi, '\n');
    };

    if (isAdminRoute) return null;

    return (
        <>
            {/* Nút bấm nổi mở Modal ở góc phải màn hình */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-40 font-sans">
                    {/* Tooltip gợi ý chat ban đầu */}
                    {showPromptHint && (
                        <div className="absolute bottom-16 right-0 mb-2 w-80 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-orange-200 text-xs text-gray-700 animate-bounce duration-1000 flex items-start justify-between gap-3">
                            <div>
                                <p className="font-bold text-orange-600 flex items-center gap-1.5 mb-1 text-sm">
                                    <Sparkles size={16} className="text-orange-500 fill-orange-500" /> Cần tìm phòng gấp?
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Mở ngay <strong>AI Trợ lý</strong> để tra cứu phòng trọ thực tế, so sánh giá và nhận link xem phòng tức thì!
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPromptHint(false);
                                }}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setIsOpen(true);
                            setShowPromptHint(false);
                        }}
                        className="group relative flex items-center gap-3 px-5 h-14 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white shadow-xl hover:shadow-orange-300 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer ring-4 ring-orange-200/50"
                        aria-label="Mở trợ lý AI tìm phòng trọ"
                    >
                        <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs">
                            <Bot size={22} className="text-white transition-transform group-hover:rotate-12 duration-300" />
                            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                            </span>
                        </span>
                        <div className="text-left hidden sm:block pr-1">
                            <p className="text-xs font-bold leading-tight flex items-center gap-1">
                                Trợ Lý AI
                                <Sparkles size={11} className="text-yellow-200 fill-yellow-200" />
                            </p>
                            <p className="text-[10px] text-orange-100 font-medium leading-tight">Tìm phòng thông minh</p>
                        </div>
                    </button>
                </div>
            )}

            {/* ================= MODAL LỚN CHÍNH (CENTER SCREEN LARGE MODAL) ================= */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setIsOpen(false);
                    }}
                >
                    <div
                        className={`bg-white shadow-[0_25px_70px_rgba(0,0,0,0.35)] flex flex-col md:flex-row overflow-hidden transition-all duration-300 border border-white/20 ring-1 ring-black/5 ${
                            isFullscreen
                                ? 'fixed inset-0 w-full h-full rounded-none'
                                : 'w-[96vw] max-w-[1340px] h-[92vh] max-h-[920px] rounded-3xl'
                        }`}
                    >
                        {/* ================= CỘT TRÁI (SIDEBAR) ================= */}
                        {isSidebarOpen && (
                            <div className="w-full md:w-80 lg:w-88 bg-gradient-to-b from-orange-50/70 via-amber-50/30 to-white border-r border-orange-100 flex flex-col flex-shrink-0 transition-all duration-200">
                                {/* Brand Header */}
                                <div className="p-5 border-b border-orange-100/80 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/30">
                                            <Bot size={26} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base leading-tight flex items-center gap-1.5">
                                                PhongTrọ AI
                                                <Sparkles size={15} className="text-yellow-200 fill-yellow-200" />
                                            </h2>
                                            <p className="text-xs text-orange-100 font-medium mt-0.5">Trợ lý tìm phòng thông minh</p>
                                        </div>
                                    </div>

                                    {/* Nút ẩn sidebar trên desktop */}
                                    <button
                                        type="button"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="hidden md:flex p-1.5 text-orange-100 hover:text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
                                        title="Thu gọn thanh bên"
                                    >
                                        <PanelLeftClose size={18} />
                                    </button>
                                </div>

                                {/* User Status Card */}
                                <div className="p-4 border-b border-orange-100/60">
                                    {isLoggedIn ? (
                                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-orange-100 shadow-xs">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-xs">
                                                {dataUser?.avatar ? (
                                                    <img
                                                        src={dataUser.avatar}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover rounded-full"
                                                    />
                                                ) : (
                                                    dataUser?.fullName?.charAt(0)?.toUpperCase() || 'U'
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 text-xs truncate">
                                                    {dataUser?.fullName || 'Người dùng'}
                                                </p>
                                                <p className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium mt-0.5">
                                                    <CheckCircle2 size={13} /> Lưu lịch sử tự động
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-white rounded-2xl border border-orange-100 shadow-xs text-xs text-gray-600">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="font-semibold text-gray-700">Khách vãng lai</span>
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                                                    Tạm thời
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mb-2 leading-relaxed">
                                                Đăng nhập để lưu trữ lịch sử tư vấn và xem lại phòng trọ đã gợi ý.
                                            </p>
                                            <Link
                                                to="/login"
                                                onClick={() => setIsOpen(false)}
                                                className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs transition-colors shadow-xs"
                                            >
                                                <LogIn size={13} /> Đăng nhập ngay
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Suggestion Prompts List */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 px-1 flex items-center gap-1.5">
                                            <Search size={13} /> Gợi ý tìm kiếm nhanh
                                        </p>
                                        <div className="space-y-3">
                                            {SUGGESTION_CATEGORIES.map((cat, cIdx) => (
                                                <div key={cIdx} className="bg-white rounded-2xl p-3.5 border border-orange-100/70 shadow-xs">
                                                    <div className="flex items-center gap-1.5 font-bold text-xs text-gray-800 mb-2.5">
                                                        {cat.icon}
                                                        <span>{cat.title}</span>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {cat.items.map((item, iIdx) => (
                                                            <button
                                                                key={iIdx}
                                                                onClick={() => handleSendMessage(item.query)}
                                                                disabled={loading}
                                                                className="w-full text-left p-2.5 rounded-xl text-xs text-gray-600 hover:text-orange-700 hover:bg-orange-50 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50"
                                                            >
                                                                <span className="line-clamp-1">{item.label}</span>
                                                                <ChevronRight
                                                                    size={14}
                                                                    className="text-gray-300 group-hover:text-orange-500 transition-colors flex-shrink-0"
                                                                />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Footer Actions */}
                                <div className="p-3.5 border-t border-orange-100 bg-white/80 flex items-center gap-2">
                                    <Popconfirm
                                        title="Xóa toàn bộ lịch sử?"
                                        description="Bạn có chắc chắn muốn làm mới toàn bộ cuộc trò chuyện này?"
                                        onConfirm={handleClearHistory}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <button
                                            type="button"
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer font-medium"
                                        >
                                            <Trash2 size={14} /> Xóa lịch sử
                                        </button>
                                    </Popconfirm>

                                    <button
                                        type="button"
                                        onClick={fetchChatHistory}
                                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                                        title="Tải lại tin nhắn"
                                    >
                                        <RotateCcw size={15} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ================= CỘT PHẢI (MAIN CHAT AREA) ================= */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
                            {/* Modal Header */}
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-xs z-10">
                                <div className="flex items-center gap-3">
                                    {/* Nút mở lại sidebar nếu đang thu gọn */}
                                    {!isSidebarOpen && (
                                        <button
                                            type="button"
                                            onClick={() => setIsSidebarOpen(true)}
                                            className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors cursor-pointer mr-1"
                                            title="Mở thanh gợi ý & cài đặt"
                                        >
                                            <PanelLeftOpen size={20} />
                                        </button>
                                    )}

                                    <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-md">
                                        <Bot size={22} />
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-gray-800 leading-tight flex items-center gap-2">
                                            AI Trợ Lý Tìm Phòng Trọ
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200/60">
                                                ⚡ Groq AI Realtime
                                            </span>
                                        </h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                                            Tư vấn & tra cứu dữ liệu phòng trọ trực tiếp theo thời gian thực
                                        </p>
                                    </div>
                                </div>

                                {/* Modal Controls */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsFullscreen(!isFullscreen)}
                                        className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                                        title={isFullscreen ? 'Thu nhỏ kích thước' : 'Phóng to toàn màn hình'}
                                    >
                                        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                                        title="Đóng modal (Esc)"
                                    >
                                        <X size={20} />
                                        <span className="text-[10px] font-mono text-gray-400 hidden sm:inline">Esc</span>
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages Feed */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 bg-gradient-to-b from-gray-50/50 via-white to-white text-sm">
                                {/* Màn hình Chào mừng (Hero Section) khi chưa có nhiều hội thoại */}
                                {messages.length <= 1 && (
                                    <div className="max-w-3xl mx-auto my-4 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-xl shadow-orange-200 mb-4 animate-in zoom-in-75 duration-300">
                                            <Bot size={32} />
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                            Tìm kiếm phòng trọ thông minh với AI
                                        </h3>
                                        <p className="text-gray-500 text-xs sm:text-sm max-w-xl mx-auto mb-6 leading-relaxed">
                                            Hỏi đáp nhanh mọi thông tin phòng trọ, căn hộ mini, giá điện nước, vị trí và tư vấn hợp đồng thuê theo dữ liệu thực tế hệ thống.
                                        </p>

                                        {/* 4 Cards gợi ý nổi bật */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                                            <button
                                                onClick={() => handleSendMessage('Tìm cho mình các phòng trọ giá dưới 3 triệu với')}
                                                className="p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-xs group cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-2 font-bold text-gray-800 text-xs mb-1 group-hover:text-orange-600">
                                                    <DollarSign size={16} className="text-emerald-500" />
                                                    <span>Phòng trọ dưới 3 triệu</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-2">
                                                    Tìm các phòng giá rẻ, tiết kiệm chi phí cho sinh viên và người mới đi làm
                                                </p>
                                            </button>

                                            <button
                                                onClick={() => handleSendMessage('Tìm phòng trọ ở khu vực quận Cầu Giấy và Đống Đa')}
                                                className="p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-xs group cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-2 font-bold text-gray-800 text-xs mb-1 group-hover:text-orange-600">
                                                    <MapPin size={16} className="text-orange-500" />
                                                    <span>Khu vực Cầu Giấy, Đống Đa</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-2">
                                                    Vị trí trung tâm gần các trường đại học, tiện đường đi làm và bến xe bus
                                                </p>
                                            </button>

                                            <button
                                                onClick={() => handleSendMessage('Tìm phòng trọ khép kín đầy đủ điều hòa, bình nóng lạnh, máy giặt')}
                                                className="p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-xs group cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-2 font-bold text-gray-800 text-xs mb-1 group-hover:text-orange-600">
                                                    <Home size={16} className="text-blue-500" />
                                                    <span>Đầy đủ tiện nghi nội thất</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-2">
                                                    Có điều hòa, nóng lạnh, máy giặt, gác lửng, ban công thoáng mát chỉ việc dọn vào ở
                                                </p>
                                            </button>

                                            <button
                                                onClick={() => handleSendMessage('Quy trình đặt cọc và những lưu ý khi ký hợp đồng thuê trọ là gì?')}
                                                className="p-4 rounded-2xl border border-gray-200/90 bg-white hover:border-orange-300 hover:bg-orange-50/50 transition-all shadow-xs group cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-2 font-bold text-gray-800 text-xs mb-1 group-hover:text-orange-600">
                                                    <FileText size={16} className="text-purple-500" />
                                                    <span>Lưu ý đặt cọc & hợp đồng</span>
                                                </div>
                                                <p className="text-[11px] text-gray-500 line-clamp-2">
                                                    Kinh nghiệm kiểm tra điện nước, điều khoản hoàn cọc và mẫu hợp đồng thuê chuẩn
                                                </p>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {messages.map((msg, index) => {
                                    const isUser = msg.sender === 'user';
                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-3.5 max-w-4xl ${
                                                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                                            }`}
                                        >
                                            {!isUser ? (
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-md mt-0.5">
                                                    <Bot size={20} />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-md">
                                                    <User size={18} />
                                                </div>
                                            )}

                                            <div
                                                className={`px-5 py-4 rounded-3xl text-sm leading-relaxed ${
                                                    isUser
                                                        ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white rounded-tr-xs shadow-md'
                                                        : msg.isError
                                                        ? 'bg-red-50 text-red-800 rounded-tl-xs shadow-xs border border-red-200'
                                                        : 'bg-white text-gray-800 rounded-tl-xs shadow-sm border border-gray-100/90'
                                                }`}
                                            >
                                                {isUser ? (
                                                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                                ) : (
                                                    <div className="chatbot-markdown-content overflow-x-auto text-sm leading-relaxed">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkGfm]}
                                                            rehypePlugins={[rehypeRaw]}
                                                            components={{
                                                                a: ({ href, children, ...props }) => {
                                                                    const isInternal = href && href.startsWith('/detail/');
                                                                    if (isInternal) {
                                                                        return (
                                                                            <Link
                                                                                to={href}
                                                                                onClick={() => setIsOpen(false)}
                                                                                className="inline-flex items-center gap-1.5 my-1 mx-1 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-100/80 text-orange-800 hover:bg-orange-500 hover:text-white transition-all shadow-xs border border-orange-200 group"
                                                                                {...props}
                                                                            >
                                                                                <Home size={13} className="text-orange-600 group-hover:text-white" />
                                                                                <span>{children}</span>
                                                                                <ExternalLink size={12} className="opacity-70 group-hover:opacity-100" />
                                                                            </Link>
                                                                        );
                                                                    }
                                                                    return (
                                                                        <a
                                                                            href={href}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-orange-600 underline font-medium hover:text-orange-700 inline-flex items-center gap-0.5"
                                                                            {...props}
                                                                        >
                                                                            {children}
                                                                            <ExternalLink size={12} />
                                                                        </a>
                                                                    );
                                                                },
                                                                table: ({ children }) => (
                                                                    <div className="overflow-x-auto my-4 rounded-2xl border border-gray-200 shadow-xs max-w-full">
                                                                        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm text-left bg-white">
                                                                            {children}
                                                                        </table>
                                                                    </div>
                                                                ),
                                                                thead: ({ children }) => (
                                                                    <thead className="bg-gradient-to-r from-orange-50 to-amber-50 text-gray-800 font-semibold border-b border-gray-200">
                                                                        {children}
                                                                    </thead>
                                                                ),
                                                                th: ({ children }) => (
                                                                    <th className="px-4 py-3 font-semibold text-gray-800 border-b border-gray-200 whitespace-nowrap">
                                                                        {children}
                                                                    </th>
                                                                ),
                                                                td: ({ children }) => (
                                                                    <td className="px-4 py-2.5 border-b border-gray-100 text-gray-700">
                                                                        {children}
                                                                    </td>
                                                                ),
                                                                h1: ({ children }) => (
                                                                    <h3 className="font-bold text-lg text-gray-900 mt-4 mb-2 border-b border-gray-100 pb-1">
                                                                        {children}
                                                                    </h3>
                                                                ),
                                                                h2: ({ children }) => (
                                                                    <h4 className="font-bold text-base text-gray-900 mt-3 mb-1.5">
                                                                        {children}
                                                                    </h4>
                                                                ),
                                                                h3: ({ children }) => (
                                                                    <h5 className="font-bold text-sm text-orange-600 mt-2.5 mb-1">
                                                                        {children}
                                                                    </h5>
                                                                ),
                                                                h4: ({ children }) => (
                                                                    <h6 className="font-bold text-xs text-gray-800 mt-2 mb-1">
                                                                        {children}
                                                                    </h6>
                                                                ),
                                                                ul: ({ children }) => (
                                                                    <ul className="list-disc pl-5 my-2.5 space-y-1">
                                                                        {children}
                                                                    </ul>
                                                                ),
                                                                ol: ({ children }) => (
                                                                    <ol className="list-decimal pl-5 my-2.5 space-y-1">
                                                                        {children}
                                                                    </ol>
                                                                ),
                                                                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                                                                p: ({ children }) => (
                                                                    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                                                                ),
                                                                strong: ({ children }) => (
                                                                    <strong className="font-semibold text-gray-900">
                                                                        {children}
                                                                    </strong>
                                                                ),
                                                                blockquote: ({ children }) => (
                                                                    <blockquote className="border-l-4 border-orange-400 pl-3.5 my-2.5 italic text-gray-600 bg-orange-50/40 py-1.5 rounded-r-lg">
                                                                        {children}
                                                                    </blockquote>
                                                                ),
                                                                code: ({ children }) => (
                                                                    <code className="bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded-md text-xs font-mono">
                                                                        {children}
                                                                    </code>
                                                                ),
                                                            }}
                                                        >
                                                            {formatBotMessage(msg.content)}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Typing Loading Indicator */}
                                {loading && (
                                    <div className="flex items-start gap-3.5 mr-auto">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white flex-shrink-0 shadow-md mt-0.5">
                                            <Bot size={20} />
                                        </div>
                                        <div className="bg-white px-5 py-4 rounded-3xl rounded-tl-xs shadow-sm border border-gray-100 flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-bounce"></div>
                                            <div
                                                className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-bounce"
                                                style={{ animationDelay: '0.2s' }}
                                            ></div>
                                            <div
                                                className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-bounce"
                                                style={{ animationDelay: '0.4s' }}
                                            ></div>
                                            <span className="text-xs text-gray-500 ml-2 font-medium">
                                                AI đang tìm kiếm và phân tích phòng trọ từ hệ thống...
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggestion Quick Chips Bar (Nằm ngay phía trên thanh nhập câu hỏi) */}
                            <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
                                <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 flex-shrink-0">
                                    <Sparkles size={12} className="text-orange-500" />
                                    Gợi ý nhanh:
                                </span>
                                {QUICK_CHIPS.map((chip, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={loading}
                                        onClick={() => handleSendMessage(chip.query)}
                                        className="flex-shrink-0 text-xs px-3 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-orange-700 text-gray-600 border border-gray-200 hover:border-orange-300 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                    >
                                        {chip.label}
                                    </button>
                                ))}
                            </div>

                            {/* Chat Input Section */}
                            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shadow-md">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }}
                                    className="relative flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200 transition-all"
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Nhập câu hỏi tìm phòng theo giá, khu vực, tiện ích... (Ví dụ: Tìm phòng trọ dưới 3 triệu ở Cầu Giấy)"
                                        disabled={loading}
                                        className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400"
                                    />
                                    {input && (
                                        <button
                                            type="button"
                                            onClick={() => setInput('')}
                                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                                            title="Xóa nội dung nhập"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || loading}
                                        className="h-11 px-5 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all shadow-md shadow-orange-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        <span>Gửi</span>
                                        <Send size={15} />
                                    </button>
                                </form>
                                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-1">
                                    <span className="flex items-center gap-1">
                                        <CornerDownLeft size={12} className="text-gray-400" />
                                        Nhấn <strong>Enter</strong> để gửi câu hỏi • <strong>Esc</strong> để đóng modal
                                    </span>
                                    <span className="text-orange-500 font-medium">⚡ Groq AI Realtime Engine</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ChatbotWidget;
