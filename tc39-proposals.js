export const fetchTC39Proposals = async () => {
    return await fetch("https://tc39.es/dataset/proposals.json").then(res => res.json());
};
