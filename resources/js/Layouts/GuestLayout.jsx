import { Link, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function GuestLayout({ children }) {
    const { settings } = usePage().props;

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href={route('home')} className="flex items-center gap-2 font-bold text-2xl text-blue-600">
                    <BookOpen className="h-8 w-8" />
                    <span>{settings?.site_name || 'TokoBuku'}</span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-6 shadow-md sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
