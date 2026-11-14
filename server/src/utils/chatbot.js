const Groq = require('groq-sdk');
const modelRoom = require('../models/room.model');
const { BadRequestError } = require('../core/error.response');

/**
 * Lấy danh sách phòng và tổng quan hệ thống từ cơ sở dữ liệu để làm RAG context
 */
const getRoomContextData = async (query = '') => {
    try {
        const queryLower = query.toLowerCase();
        const allRooms = await modelRoom
            .find({ status: 'available' })
            .populate('categoryId')
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        if (!allRooms || allRooms.length === 0) {
            return {
                totalRooms: 0,
                roomSummary: 'Hiện tại chưa có phòng trọ nào đang mở cho thuê trong hệ thống.',
            };
        }

        // Tìm kiếm các phòng phù hợp nhất dựa trên từ khóa tìm kiếm của người dùng
        const matchedRooms = allRooms.filter((r) => {
            if (!queryLower) return true;
            const titleMatch = r.title?.toLowerCase().includes(queryLower);
            const addressMatch = r.address?.toLowerCase().includes(queryLower);
            const utilMatch = r.utilities?.some((u) => u.toLowerCase().includes(queryLower));
            const amenityMatch = r.buildingAmenities?.some((a) => a.toLowerCase().includes(queryLower));
            const catMatch = r.categoryId?.nameCategory?.toLowerCase().includes(queryLower);
            return titleMatch || addressMatch || utilMatch || amenityMatch || catMatch;
        });

        const selectedRooms = matchedRooms.length > 0 ? matchedRooms.slice(0, 5) : allRooms.slice(0, 5);

        const roomSummary = selectedRooms
            .map((r, index) => {
                const priceFormatted = Number(r.price).toLocaleString('vi-VN') + ' đ/tháng';
                const depositFormatted = r.deposit ? Number(r.deposit).toLocaleString('vi-VN') + ' đ' : 'Thỏa thuận';
                const utilities = Array.isArray(r.utilities) ? r.utilities.join(', ') : 'Đang cập nhật';
                const amenities = Array.isArray(r.buildingAmenities) ? r.buildingAmenities.join(', ') : 'Đang cập nhật';
                const electricity = r.pricesDetail?.electricity
                    ? `${r.pricesDetail.electricity.toLocaleString('vi-VN')} đ/kWh`
                    : '3.800 đ/kWh';
                const water = r.pricesDetail?.water
                    ? `${r.pricesDetail.water.toLocaleString('vi-VN')} đ/m³`
                    : '25.000 đ/m³';
                const category = r.categoryId?.nameCategory || 'Phòng trọ';

                return `[Phòng ${index + 1}]
- ID: ${r._id}
- Tiêu đề: ${r.title}
- Loại phòng: ${category}
- Giá thuê: ${priceFormatted}
- Diện tích: ${r.area} m²
- Địa chỉ: ${r.address}
- Tiện ích phòng: ${utilities}
- Tiện ích tòa nhà: ${amenities}
- Chi phí: Điện ${electricity}, Nước ${water}, Cọc: ${depositFormatted}
- Hợp đồng tối thiểu: ${r.minContractMonths || 6} tháng
- Chủ phòng: ${r.ownerName || 'Chủ trọ'} - SĐT: ${r.ownerPhone || 'Liên hệ khi xem phòng'}
- Link chi tiết: /detail/${r._id}`;
            })
            .join('\n\n');

        return {
            totalRooms: allRooms.length,
            roomSummary,
        };
    } catch (error) {
        console.error('Error fetching room context:', error.message);
        return {
            totalRooms: 0,
            roomSummary: 'Không thể truy xuất dữ liệu phòng trọ lúc này.',
        };
    }
};

/**
 * Gọi trực tiếp Groq AI Assistant kết hợp dữ liệu phòng trọ.
 * Nếu có lỗi từ Groq SDK hoặc cấu hình, BÁO LỖI LUÔN, tuyệt đối không trả về dữ liệu mẫu hay fallback.
 */
const askRentalAssistant = async (question, chatHistory = []) => {
    // 1. Kiểm tra API key
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
        throw new BadRequestError('GROQ_API_KEY chưa được cấu hình trong server/.env');
    }

    // 2. Chuẩn bị RAG context từ cơ sở dữ liệu
    const contextData = await getRoomContextData(question);

    const systemPrompt = `Bạn là "AI Trợ lý Tìm Phòng Trọ" (PhongTro AI Assistant), chuyên gia tư vấn thuê phòng trọ nhiệt tình, thân thiện và thấu hiểu nhu cầu của sinh viên và người đi làm tại Việt Nam.

DỮ LIỆU PHÒNG TRỌ THỜI GIAN THỰC TỪ HỆ THỐNG:
Tổng số phòng đang mở: ${contextData.totalRooms} phòng.
Danh sách các phòng phù hợp nhất:
${contextData.roomSummary}

HƯỚNG DẪN TRẢ LỜI:
1. Luôn chào hỏi thân thiện, sử dụng xưng hô "mình" - "bạn" lịch sự và gần gũi.
2. Khi người dùng hỏi tìm phòng (theo giá, khu vực, tiện ích): Hãy tận dụng thông tin các phòng ở trên để gợi ý cụ thể: Nêu tên phòng, giá thuê (VNĐ/tháng), địa chỉ ngắn gọn, các tiện ích nổi bật và LUÔN đính kèm link dạng [Xem chi tiết phòng](/detail/{id}).
3. Nếu không có phòng đúng chính xác 100%, hãy gợi ý các phòng gần nhất hoặc tư vấn khoảng giá thị trường và cách tìm phòng an toàn.
4. Hướng dẫn các bước thuê trọ: Xem phòng trực tiếp, kiểm tra điện nước, đặt cọc giữ chỗ (thường 1 tháng), đọc kỹ hợp đồng thuê trọ và khai báo tạm trú.
5. ĐỊNH DẠNG TRÌNH BÀY ĐẸP:
   - Dùng gạch đầu dòng (• hoặc -) cho các danh sách tiện ích, chi phí.
   - In đậm (**giá tiền**, **tên phòng**, **địa chỉ**).
   - KHÔNG dùng thẻ HTML như <br> (hãy xuống dòng thông thường).
   - KHÔNG lạm dụng các ký tự tiêu đề như ####, ##### (hãy dùng chữ in đậm **Tiêu đề** để giao diện hiển thị gọn đẹp).
   - Có thể dùng bảng Markdown ngắn gọn khi so sánh nhiều phòng.
6. Trả lời bằng tiếng Việt tự nhiên, súc tích, đi thẳng vào trọng tâm câu hỏi.`;

    // 3. Gọi Groq SDK và ném lỗi trực tiếp nếu thất bại
    try {
        const groq = new Groq({ apiKey });

        const formattedHistory = (chatHistory || []).slice(-6).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.content,
        }));

        const messages = [
            { role: 'system', content: systemPrompt },
            ...formattedHistory,
            { role: 'user', content: question },
        ];

        const model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

        const completion = await groq.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        const answer = completion.choices[0]?.message?.content;
        if (!answer || !answer.trim()) {
            throw new BadRequestError('Không nhận được nội dung phản hồi từ Groq AI');
        }

        return answer;
    } catch (error) {
        console.error('Groq AI Request Error:', error);
        // Báo lỗi luôn, không trả về dữ liệu fallback
        const errorMessage = error?.error?.message || error?.message || 'Lỗi không xác định từ Groq AI';
        throw new BadRequestError(`Lỗi Groq AI: ${errorMessage}`);
    }
};

module.exports = {
    askRentalAssistant,
    getRoomContextData,
};
