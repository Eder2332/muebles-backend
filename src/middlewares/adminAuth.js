const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const auth =
        req.headers.authorization;

    if (!auth) {

        return res.status(401).json({
            error: "Token requerido"
        });

    }

    const token =
        auth.split(' ')[1];

    try {

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );

        if (decoded.rol !== "superadmin") {

            return res.status(403).json({
                error: "No autorizado"
            });

        }

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Token inválido"
        });

    }

};
