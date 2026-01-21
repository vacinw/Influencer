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
                                    What's new
                                </span>
                                <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                                    <span>Just shipped v1.0</span>
                                </span>
                            </a>
                        </div>
                        <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Connect Brands with Top Creators
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            InfluConnect is the premier platform for brands to find, manage, and pay influencers for impactful marketing campaigns.
                            Start your next viral campaign today.
                        </p>
                        <div className="mt-10 flex items-center gap-x-6">
                            <Link
                                to="/register"
                                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                Get started
                            </Link>
                            <Link to="/explore" className="text-sm font-semibold leading-6 text-gray-900 flex items-center group">
                                Explore creators <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">Faster Growth</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                        Everything you need to manage campaigns
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                        From discovery to payment, InfluConnect streamlines the entire influencer marketing workflow.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <TrendingUp className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Analytics that matter
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Track ROI, engagement rates, and reach in real-time. Make data-driven decisions.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <Users className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Vetted Creators
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Access a network of verified influencers across every niche and platform.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <Shield className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Secure Payments
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Escrow-style payments ensuring creators get paid and brands get their content.
                            </dd>
                        </div>
                        <div className="relative pl-16">
                            <dt className="text-base font-semibold leading-7 text-gray-900">
                                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                    <CheckCircle className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                Easy Management
                            </dt>
                            <dd className="mt-2 text-base leading-7 text-gray-600">
                                Manage contracts, content approvals, and more in one unified dashboard.
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Stats Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600">Transactions every 24 hours</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">44 million</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600">Assets under holding</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">$119 trillion</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600">New users annually</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">46,000</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
};

export default Home;
