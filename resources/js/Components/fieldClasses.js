/*
 * How Najenga's form fields look: the base classes the OKJT kit's fields
 * (AdminInput, AdminSelect, AdminTextarea) use in place of their own. Set
 * for the whole dashboard in DashboardApp (componentDefaults.Field), and
 * passed by TextInput, SelectInput and TextArea, so a field keeps its look
 * wherever it renders.
 */
export const FIELD_CLASSES = {
    input: 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 disabled:opacity-50 disabled:cursor-not-allowed',
    select: 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2712%27%20height%3D%2712%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27rgba(255,255,255,0.5)%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27M6%209l6%206%206-6%27/%3E%3C/svg%3E")] bg-no-repeat bg-[right_1rem_center] pr-10',
    textarea: 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-400 transition-all duration-200 focus:outline-none focus:border-[#8B0000] focus:ring-1 focus:ring-[#8B0000]/50 resize-none',
};
