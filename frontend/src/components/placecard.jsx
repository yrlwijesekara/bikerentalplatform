export default function Placecard({ place }) {
    return (
        <div className="place-card">
            <img src={place.image} alt={place.name} className="place-image" />
            <div className="place-info">
                <h3 className="place-name">{place.name}</h3>
                <p className="place-description">{place.description}</p>
                <p className="place-location">{place.location}</p>
            </div>
        </div>
    );
}