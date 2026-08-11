import { useForm, router } from '@inertiajs/react';
import ResourceFormPage from '@/Components/ResourceFormPage';
import ResourceFormFields from '@/Components/ResourceFormFields';
import FormActions from '@/Components/FormActions';
import { computeDefaults } from '@/Config/fieldBuilder';

export default function ResourceForm({
    title,
    breadcrumbs,
    schema,
    method = 'post',
    action,
    initialData = {},
    cancelHref,
    submitLabel,
    loadingText,
    onSuccess,
    transform,
}) {
    const defaults = { ...computeDefaults(schema), ...initialData };

    const formProps = useForm(defaults);
    const { data, setData, processing, errors } = formProps;

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = transform ? transform({ ...data }) : data;

        if (method === 'patch') {
            router.patch(action, payload, {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                    else router.visit(cancelHref);
                },
            });
        } else {
            router.post(action, payload, {
                onSuccess: () => {
                    if (onSuccess) onSuccess();
                    else router.visit(cancelHref);
                },
            });
        }
    };

    return (
        <ResourceFormPage title={title} breadcrumbs={breadcrumbs}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <ResourceFormFields schema={schema} data={data} setData={setData} errors={errors} />
                <FormActions
                    cancelHref={cancelHref}
                    submitLabel={submitLabel || (method === 'patch' ? 'Update' : 'Create')}
                    processing={processing}
                    loadingText={loadingText || (method === 'patch' ? 'Updating...' : 'Creating...')}
                />
            </form>
        </ResourceFormPage>
    );
}
