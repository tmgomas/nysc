import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';

type Props = { status?: string; };

export default function Login({ status }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your email below to log in to your account"
        >
            <Head title="Log in" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                {status && <div className="text-sm text-green-600">{status}</div>}

                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            name="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <TextLink href="/forgot-password" tabIndex={4}>
                                Forgot password?
                            </TextLink>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        tabIndex={3}
                        disabled={processing}
                    >
                        {processing && <Spinner />}
                        Log in
                    </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <TextLink href="/register" tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
