import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-24 pb-16">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                        <div className="mt-24 sm:mt-32 lg:mt-16">
                            <a href="#" className="inline-flex space-x-6">
                                <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-600 ring-1 ring-inset ring-indigo-600/10">
                                    Có gì mới
                                </span>
                                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                                    <span>Vừa ra mắt phiên bản v1.0</span>
                                </span>
                            </a>
                        </div>
                        <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Kết Nối Thương Hiệu Với Nhãn Hàng Sáng Tạo Hàng Đầu
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            InfluConnect là nền tảng hàng đầu dành cho thương hiệu để tìm kiếm, quản lý và thanh toán cho Influencer trong các chiến dịch marketing hiệu quả.
                            Bắt đầu chiến dịch bùng nổ của bạn ngay hôm nay.
                        </p>
                        <div className="mt-10 flex items-center gap-x-6">
                            <Link
                                to="/register"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Bắt đầu ngay
                            </Link>
                            <Link to="/explore" className="text-sm font-semibold leading-6 text-gray-900 flex items-center group">
                                Khám phá Creators <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                    {/* Hero Image/Illustration */}
                    <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                        <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                                <img
                                    src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2089&q=80"
                                    alt="App screenshot"
                                    width={2432}
                                    height={1442}
                                    className="w-[40rem] lg:w-[48rem] max-w-none rounded-md shadow-2xl ring-1 ring-gray-900/10 object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Phát Triển Nhanh Chóng</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Mọi công cụ bạn cần để quản lý chiến dịch
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        Từ khâu tìm kiếm đến thanh toán, InfluConnect tối ưu hóa toàn bộ quy trình Influencer Marketing.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <TrendingUp className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Phân Tích Chuyên Sâu
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Theo dõi tỷ suất sinh lời (ROI), tỷ lệ tương tác và phạm vi tiếp cận theo thời gian thực. Đưa ra quyết định dựa trên dữ liệu.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Creator Đã Qua Kiểm Duyệt
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Tiếp cận mạng lưới các Influencer đã được xác minh.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Thanh Toán An Toàn
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Thanh toán qua hệ thống tạm giữ (Escrow) đảm bảo Creator nhận được tiền và thương hiệu nhận được nội dung đúng hẹn.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Quản Lý Dễ Dàng
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Quản lý hợp đồng, duyệt nội dung và nhiều tính năng khác trong một bảng điều khiển thống nhất.
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Stats Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600">Giao dịch mỗi 24 giờ</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">44 triệu</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600">Tài sản đang lưu giữ</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">$119 nghìn tỷ</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600">Người dùng mới hàng năm</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">46,000</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default Home;
