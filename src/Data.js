// TODO move to some sort of ENV file for external configuration
export const EPPIC_SERVER = "http://128.6.159.137";

export const INTERF_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/interfaces/";

export const INTERF_RESIDUE_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/interfaceResidues/";

export const ASSEMBLIES_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/assemblies/";

export const ASSEMBLIES_DIAGRAM_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/assemblyDiagram/";

export const SEQUENCES_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/sequences/";

export const FILE_UPLOAD_END_POINT = EPPIC_SERVER + "/rest/api/v3/submit/new";

export const FILE_STATUS_END_POINT = EPPIC_SERVER + "/rest/api/v3/submit/status/";

export const PDBINFO_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/pdb/";

export const IMAGE_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/image/"

export const ASSEMBLY_CIF_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/assemblyCifFile/"
export const INTERFACE_CIF_END_POINT = EPPIC_SERVER + "/rest/api/v3/job/interfaceCifFile/"

export const CONFIDENCE_EXCELLENT = 'images/excellent.png'

export const CONFIDENCE_GOOD = 'images/good.png'

export const BIO_EXCELLENT_CUTOFF = 0.95

export const BIO_GOOD_CUTOFF = 0.8

export const XTAL_EXCELLENT_CUTOFF = 0.05

export const XTAL_GOOD_CUTOFF = 0.2

export function getInterfCifUrl(pdbId, interfaceId) {
    return INTERFACE_CIF_END_POINT + pdbId + "/" + interfaceId;
}

export function getAssemblyCifUrl(pdbId, assemblyId) {
    return ASSEMBLY_CIF_END_POINT + pdbId + "/" + assemblyId;
}

export function getInterfImgUrl(jobId, interfId) {
    return IMAGE_END_POINT + jobId + "/interface/" + interfId;
}

export function getAssemblyImgUrl(jobId, assemblyId) {
    return IMAGE_END_POINT + jobId + "/assembly/" + assemblyId;
}
export function getAssemblyDiagramImgUrl(jobId, assemblyId) {
    return IMAGE_END_POINT + jobId + "/diagram/" + assemblyId;
}

export function getOpTypeImgUrl(opType) {
    const optypeUrl = "images/optype_";
    const optypeSuffix = ".png";
    return optypeUrl + opType + optypeSuffix;
}

export function transformInterfData(data) {
    var tData = [];

    data.forEach(item => {
        var scoresPerMethod = {};
        item.interfaceScores.forEach(scoreObj => {
            scoresPerMethod[scoreObj.method] = scoreObj;
        });
        for(var method in scoresPerMethod) {
            item[method] = scoresPerMethod[method];
        }
        tData.push(item);
        });

    tData.forEach(item => {
        delete item.interfaceScores;
    });

    return tData;
}

export function transformAssembliesData(data) {
    var tData = [];

    data.forEach(item => {
        var scoresPerMethod = {};

        if (item.id !== 0) { // we skip the special 0 assembly
            item.assemblyScores.forEach(scoreObj => {
                scoresPerMethod[scoreObj.method] = scoreObj;
            });
            for(var method in scoresPerMethod) {
                item[method] = scoresPerMethod[method];
            }

            tData.push(item);
            var sizes = [];
            var syms = [];
            var stos = [];
            item.assemblyContents.forEach(cont => {
                sizes.push(cont.mmSize);
                syms.push(cont.symmetry);
                stos.push(cont.stoichiometry);
            });
            item["mmSizes"] = sizes.join(", ");
            item["symmetries"] = syms.join(", ");
            item["stoichiometries"] = stos.join(", ");
        }
    });

    tData.forEach(item => {
        delete item.assemblyScores;
    });

    return tData;
}